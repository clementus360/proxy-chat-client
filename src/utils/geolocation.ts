interface LocationData {
    latitude: number;
    longitude: number;
}

// IP-based geolocation fallback
async function getLocationByIP(): Promise<LocationData> {
    console.log("Starting IP-based geolocation...");
    try {
        const response = await fetch('https://ipapi.co/json/');
        console.log("IP geolocation API response received");
        const data = await response.json();
        console.log("IP geolocation data:", data);

        if (data.latitude && data.longitude) {
            console.log("Location obtained via IP geolocation:", {
                latitude: data.latitude,
                longitude: data.longitude
            });
            return {
                latitude: data.latitude,
                longitude: data.longitude
            };
        }
        console.error("IP geolocation returned invalid data:", data);
        throw new Error("IP geolocation returned invalid data");
    } catch (error) {
        console.error("IP geolocation failed:", error);
        throw error; // Re-throw to be caught by the main function
    }
}

// Try browser geolocation with different accuracy settings
function tryBrowserGeolocation(highAccuracy: boolean): Promise<LocationData> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation not supported"));
            return;
        }

        const options = {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 15000 : 30000, // 15 seconds for high accuracy, 30 for low
            maximumAge: 0
        };

        console.log(`Trying browser geolocation with highAccuracy=${highAccuracy}, timeout=${options.timeout}ms`);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("Browser geolocation successful", { latitude, longitude });
                resolve({ latitude, longitude });
            },
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "User denied the request for geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request to get user location timed out.";
                        break;
                    default:
                        errorMessage = "An unknown error occurred.";
                        break;
                }
                console.error(`Error getting geolocation: ${errorMessage}`, error);
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

export const getUserLocation = async (): Promise<LocationData | null> => {
    try {
        console.log("Attempting to get user location with high accuracy...");
        // First try with high accuracy
        return await tryBrowserGeolocation(true);
    } catch (highAccuracyError) {
        console.log("High accuracy geolocation failed, trying with low accuracy...");

        try {
            // Then try with low accuracy
            return await tryBrowserGeolocation(false);
        } catch (lowAccuracyError) {
            console.log("Browser geolocation failed, falling back to IP geolocation...");

            try {
                // Finally fall back to IP-based geolocation
                return await getLocationByIP();
            } catch (ipError) {
                console.error("All geolocation methods failed:", ipError);
                // If all methods fail, return null
                return null;
            }
        }
    }
};

// Alternative implementation with direct IP fallback if you suspect issues with the above
export const getUserLocationAlternative = async (): Promise<LocationData | null> => {
    console.log("Starting alternative location method");

    // First try browser geolocation
    if (navigator.geolocation) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            console.log("Browser geolocation successful (alternative method)");
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            console.log("Browser geolocation failed (alternative method), trying IP geolocation");
        }
    } else {
        console.log("Geolocation not available, trying IP geolocation");
    }

    // If browser geolocation fails or isn't available, try IP geolocation
    try {
        return await getLocationByIP();
    } catch (error) {
        console.error("IP geolocation also failed:", error);
        return null;
    }
};