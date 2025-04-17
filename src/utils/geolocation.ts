interface LocationData {
    latitude: number;
    longitude: number;
  }
  
  export async function getLocation(): Promise<LocationData | null> {
    // First try browser geolocation
    try {
      console.log("Trying browser geolocation");
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject, 
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
        console.log("Browser geolocation succeeded");
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } else {
        console.log("Geolocation not supported by this browser");
      }
    } catch (error) {
      console.log("Browser geolocation failed:", error);
    }
    
    // Then try IP geolocation
    try {
      console.log("Trying IP geolocation");
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log("IP data received:", data);
      
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        console.log("IP geolocation succeeded");
        return {
          latitude: data.latitude,
          longitude: data.longitude
        };
      } else {
        console.log("IP geolocation returned invalid data:", data);
      }
    } catch (error) {
      console.log("IP geolocation failed:", error);
    }
    
    // If all methods fail
    console.log("All geolocation methods failed");
    return null;
  }
  
  // Alternative IP geolocation service if ipapi.co doesn't work
  export async function getLocationAlternativeIP(): Promise<LocationData | null> {
    try {
      console.log("Trying alternative IP geolocation");
      const response = await fetch('https://geolocation-db.com/json/');
      const data = await response.json();
      console.log("Alternative IP data:", data);
      
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        console.log("Alternative IP geolocation succeeded");
        return {
          latitude: data.latitude,
          longitude: data.longitude
        };
      } else {
        console.log("Alternative IP geolocation returned invalid data");
      }
    } catch (error) {
      console.log("Alternative IP geolocation failed:", error);
    }
    return null;
  }
  
  // Example usage with both methods
  export async function getBestPossibleLocation(): Promise<LocationData | null> {
    // Try primary method
    const location = await getLocation();
    if (location) return location;
    
    // If primary method fails, try alternative IP service
    console.log("Primary location methods failed, trying alternative IP service");
    return await getLocationAlternativeIP();
  }