"use client";
import { useEffect, useRef, useState } from "react";
import { UpdateUser } from "@/utils/api";
import haversineDistance from "@/utils/haversineDistance";
import { useUser } from "@/context/UserContext";
import { getBestPossibleLocation } from "@/utils/geolocation";

const LOCATION_UPDATE_THRESHOLD_METERS = 5;
const FALLBACK_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function LocationUpdater() {
  const lastPosition = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { user } = useUser();
  const watchIdRef = useRef<number | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!user) {
      console.error("User not found");
      return;
    }

    // Function to update location regardless of source
    const updateUserLocation = async (lat: number, lng: number) => {
      // Calculate distance if we have a previous position
      if (lastPosition.current) {
        const distance = haversineDistance(
          lastPosition.current.latitude,
          lastPosition.current.longitude,
          lat,
          lng
        );
        
        if (distance < LOCATION_UPDATE_THRESHOLD_METERS) {
          // Not a big enough move, skip
          return;
        }
      }

      // Significant change or first position
      lastPosition.current = {
        latitude: lat,
        longitude: lng,
      };

      try {
        await UpdateUser({
          id: user.id,
          latitude: lat,
          longitude: lng,
        });
        console.log("Location updated");
      } catch (err) {
        console.error("Failed to update location", err);
      }
    };

    // Function to set up IP-based geolocation fallback
    const setupFallbackGeolocation = async () => {
      console.log("Using fallback IP geolocation");
      
      // Clear any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Get initial position using IP
      const location = await getBestPossibleLocation();
      if (location) {
        updateUserLocation(location.latitude, location.longitude);
      } else {
        console.error("All geolocation methods failed");
      }
      
      // Set up interval for periodic updates when using IP geolocation
      fallbackIntervalRef.current = setInterval(async () => {
        const refreshedLocation = await getBestPossibleLocation();
        if (refreshedLocation) {
          updateUserLocation(refreshedLocation.latitude, refreshedLocation.longitude);
        }
      }, FALLBACK_REFRESH_INTERVAL);
    };

    // Handler for browser geolocation
    const handlePosition = (pos: GeolocationPosition) => {
      const coords = pos.coords;
      updateUserLocation(coords.latitude, coords.longitude);
    };

    // Error handler for browser geolocation
    const handlePositionError = async (err: GeolocationPositionError) => {
      console.error("Browser geolocation error:", err);
      
      // Only switch to fallback if we're not already using it
      if (!usingFallback) {
        setUsingFallback(true);
        await setupFallbackGeolocation();
      }
    };

    // First try to use browser geolocation with watch
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handlePositionError,
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
    } catch (err) {
      console.error("Failed to setup geolocation watch:", err);
      setupFallbackGeolocation();
    }

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (fallbackIntervalRef.current !== null) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [user]);

  return null;
}