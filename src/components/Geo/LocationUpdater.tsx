"use client";

import { useEffect, useRef } from "react";
import { UpdateUser } from "@/utils/api"; // your function
import haversineDistance from "@/utils/haversineDistance";
import { useUser } from "@/context/UserContext";

const LOCATION_UPDATE_THRESHOLD_METERS = 20;

export function LocationUpdater() {
    const lastPosition = useRef<GeolocationCoordinates | null>(null);
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            console.error("User not found");
            return;
        }

        const handlePosition = async (pos: GeolocationPosition) => {
            const coords = pos.coords;

            if (lastPosition.current) {
                const distance = haversineDistance(
                    lastPosition.current.latitude,
                    lastPosition.current.longitude,
                    coords.latitude,
                    coords.longitude
                );

                if (distance < LOCATION_UPDATE_THRESHOLD_METERS) {
                    // Not a big enough move, skip
                    return;
                }
            }

            // Significant change
            lastPosition.current = coords;

            try {
                await UpdateUser({
                    id: user.id,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                console.log("Location updated");
            } catch (err) {
                console.error("Failed to update location", err);
            }
        };

        const watcherId = navigator.geolocation.watchPosition(
            handlePosition,
            (err) => console.error("Location error", err),
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watcherId);
        };
    }, [user]);

    return null;
}