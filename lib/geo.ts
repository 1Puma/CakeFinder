const EARTH_MILES = 3958.8;

export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const AUSTIN_CENTER = { lat: 30.2672, lng: -97.7431 };

export function cityCenter(city: string): { lat: number; lng: number } {
  if (city.toLowerCase().includes("austin")) {
    return AUSTIN_CENTER;
  }
  return AUSTIN_CENTER;
}
