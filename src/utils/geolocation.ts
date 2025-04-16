interface LocationData {
    latitude: number;
    longitude: number;
}

export const getUserLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation not supported"));
            return;
        }

        // Add timeout option for Safari
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,  // 10 seconds
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                resolve({ latitude, longitude });
            },
            (error) => {
                // More detailed error handling
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
};