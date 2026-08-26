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

export const BARCELONA_LAT = 41.3874;
export const BARCELONA_LNG = 2.1686;
// Covers the Barcelona metro area (e.g. Badalona, L'Hospitalet, Sant Cugat).
const BARCELONA_RADIUS_KM = 30;

// App is currently launching in Barcelona only — gate onboarding on this.
export function isInBarcelona(lat?: number, lng?: number) {
    if (lat === undefined || lng === undefined) return false;
    return distanceKm(lat, lng, BARCELONA_LAT, BARCELONA_LNG) <= BARCELONA_RADIUS_KM;
}

// Used for manually-entered cities, which have no real coordinates to distance-check.
export function isBarcelonaCityName(name: string) {
    const normalized = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    return normalized.includes("barcelona");
}