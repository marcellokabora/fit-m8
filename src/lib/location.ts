// Great-circle distance between two coordinates, in km.
export function distanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

// Used as a fallback map center when a user has no coordinates on file.
export const BARCELONA_LAT = 41.3874;
export const BARCELONA_LNG = 2.1686;

// Deterministically places a fake profile within 1-5km of the viewer's own coordinates
// (stable bearing/distance per viewer+uid) so every real user sees fake profiles clustered
// near themselves instead of at their fixed seeded location (e.g. Barcelona for everyone).
export function nearbyFakeLocation(originLat: number, originLng: number, seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    const bearingRad = ((Math.abs(hash) % 360) * Math.PI) / 180;
    const distance = 1 + (Math.abs(hash >> 8) % 5); // 1-5 km
    const latRad = (originLat * Math.PI) / 180;
    return {
        lat: originLat + (distance / 111) * Math.cos(bearingRad),
        lng: originLng + (distance / (111 * Math.cos(latRad))) * Math.sin(bearingRad),
    };
}

// Raw geolocation fix (no reverse-geocoding) used by the map check-in flow — unlike
// LocationPicker's detect(), it doesn't need a human-readable city name, just coordinates.
export function getCurrentCoords(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(new Error("unsupported"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            reject,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        );
    });
}