/**
 * Surabaya administrative geography used by PACUL's pilot.
 *
 * - The 31 kecamatan (districts) and their five administrative regions follow
 *   Kota Surabaya's official division.
 * - Centroid coordinates are APPROXIMATE (hand-placed, ~1 km precision). They
 *   are used only to place district-level aggregate markers, never to locate
 *   individual residents. Replace with an official boundary dataset (e.g. from
 *   the Surabaya open-data portal / BIG) before any operational use.
 */

export type SurabayaRegion = "Pusat" | "Utara" | "Timur" | "Selatan" | "Barat";

export interface Kecamatan {
  id: string;
  name: string;
  region: SurabayaRegion;
  /** Approximate centroid [lat, lng]. */
  center: [number, number];
}

export const SURABAYA_KECAMATAN: readonly Kecamatan[] = [
  // Surabaya Pusat
  { id: "bubutan", name: "Bubutan", region: "Pusat", center: [-7.2485, 112.733] },
  { id: "genteng", name: "Genteng", region: "Pusat", center: [-7.26, 112.744] },
  { id: "simokerto", name: "Simokerto", region: "Pusat", center: [-7.242, 112.75] },
  { id: "tegalsari", name: "Tegalsari", region: "Pusat", center: [-7.271, 112.737] },
  // Surabaya Utara
  { id: "bulak", name: "Bulak", region: "Utara", center: [-7.238, 112.788] },
  { id: "kenjeran", name: "Kenjeran", region: "Utara", center: [-7.228, 112.768] },
  { id: "krembangan", name: "Krembangan", region: "Utara", center: [-7.23, 112.725] },
  { id: "pabean-cantian", name: "Pabean Cantian", region: "Utara", center: [-7.215, 112.738] },
  { id: "semampir", name: "Semampir", region: "Utara", center: [-7.223, 112.75] },
  // Surabaya Timur
  { id: "gubeng", name: "Gubeng", region: "Timur", center: [-7.275, 112.753] },
  { id: "gunung-anyar", name: "Gunung Anyar", region: "Timur", center: [-7.335, 112.803] },
  { id: "mulyorejo", name: "Mulyorejo", region: "Timur", center: [-7.265, 112.795] },
  { id: "rungkut", name: "Rungkut", region: "Timur", center: [-7.32, 112.785] },
  { id: "sukolilo", name: "Sukolilo", region: "Timur", center: [-7.29, 112.795] },
  { id: "tambaksari", name: "Tambaksari", region: "Timur", center: [-7.253, 112.761] },
  { id: "tenggilis-mejoyo", name: "Tenggilis Mejoyo", region: "Timur", center: [-7.32, 112.755] },
  // Surabaya Selatan
  { id: "dukuh-pakis", name: "Dukuh Pakis", region: "Selatan", center: [-7.285, 112.708] },
  { id: "gayungan", name: "Gayungan", region: "Selatan", center: [-7.33, 112.725] },
  { id: "jambangan", name: "Jambangan", region: "Selatan", center: [-7.323, 112.712] },
  { id: "karang-pilang", name: "Karang Pilang", region: "Selatan", center: [-7.335, 112.693] },
  { id: "sawahan", name: "Sawahan", region: "Selatan", center: [-7.27, 112.72] },
  { id: "wiyung", name: "Wiyung", region: "Selatan", center: [-7.31, 112.685] },
  { id: "wonocolo", name: "Wonocolo", region: "Selatan", center: [-7.315, 112.74] },
  { id: "wonokromo", name: "Wonokromo", region: "Selatan", center: [-7.295, 112.735] },
  // Surabaya Barat
  { id: "asemrowo", name: "Asemrowo", region: "Barat", center: [-7.245, 112.705] },
  { id: "benowo", name: "Benowo", region: "Barat", center: [-7.23, 112.64] },
  { id: "lakarsantri", name: "Lakarsantri", region: "Barat", center: [-7.3, 112.645] },
  { id: "pakal", name: "Pakal", region: "Barat", center: [-7.245, 112.615] },
  { id: "sambikerep", name: "Sambikerep", region: "Barat", center: [-7.275, 112.655] },
  { id: "sukomanunggal", name: "Sukomanunggal", region: "Barat", center: [-7.26, 112.7] },
  { id: "tandes", name: "Tandes", region: "Barat", center: [-7.255, 112.675] },
] as const;

export const SURABAYA_CENTER: [number, number] = [-7.2755, 112.7255];

/** Loose bounding box used to check whether a coordinate is inside the pilot area. */
export const SURABAYA_BOUNDS = {
  south: -7.36,
  north: -7.18,
  west: 112.59,
  east: 112.85,
} as const;

/**
 * Simplified, approximate city outline for visual orientation only.
 * Not an official administrative boundary.
 */
export const SURABAYA_APPROX_OUTLINE: [number, number][] = [
  [-7.2, 112.6],
  [-7.215, 112.66],
  [-7.2, 112.705],
  [-7.195, 112.735],
  [-7.205, 112.76],
  [-7.215, 112.79],
  [-7.235, 112.81],
  [-7.26, 112.822],
  [-7.29, 112.83],
  [-7.32, 112.838],
  [-7.345, 112.83],
  [-7.35, 112.8],
  [-7.342, 112.77],
  [-7.345, 112.74],
  [-7.35, 112.71],
  [-7.345, 112.68],
  [-7.325, 112.655],
  [-7.31, 112.625],
  [-7.285, 112.6],
  [-7.255, 112.595],
  [-7.225, 112.595],
];

export function findKecamatan(idOrName: string | undefined | null): Kecamatan | undefined {
  if (!idOrName) return undefined;
  const key = idOrName.trim().toLowerCase();
  return SURABAYA_KECAMATAN.find(
    (k) => k.id === key || k.name.toLowerCase() === key
  );
}

export function isInsideSurabaya(lat: number, lng: number): boolean {
  return (
    lat >= SURABAYA_BOUNDS.south &&
    lat <= SURABAYA_BOUNDS.north &&
    lng >= SURABAYA_BOUNDS.west &&
    lng <= SURABAYA_BOUNDS.east
  );
}

/**
 * Snap a coordinate to the nearest kecamatan centroid. Used to aggregate a
 * user's optional location to district level before it is stored.
 */
export function nearestKecamatan(lat: number, lng: number): Kecamatan {
  let best = SURABAYA_KECAMATAN[0];
  let bestDist = Infinity;
  for (const k of SURABAYA_KECAMATAN) {
    const d = (k.center[0] - lat) ** 2 + (k.center[1] - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  }
  return best;
}
