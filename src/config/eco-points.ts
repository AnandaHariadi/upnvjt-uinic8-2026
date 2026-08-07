/**
 * EcoPoints: PACUL's reward points for verified green actions.
 *
 * EcoPoints are an in-app loyalty point, not money and not a token: they
 * cannot be transferred or cashed out, and are redeemed only for rewards in
 * Bursa Pasar Hijau. All values below are PROTOTYPE REWARD RULES.
 *
 * Verified green actions (see config/green-actions.ts) are the primary
 * source. The supporting sources below are intentionally smaller.
 */

export const ECOPOINTS_LABEL = "EcoPoints";

export const SUPPORTING_ECOPOINT_SOURCES = {
  WASTE_REPORT: { amount: 30, label: "Laporan timbulan sampah terkirim" },
  CHALLENGE_JOIN: { amount: 10, label: "Bergabung dalam tantangan komunitas" },
  STEP_1000: { amount: 10, label: "Mencapai 1.000 langkah hari ini" },
  STEP_5000: { amount: 30, label: "Mencapai 5.000 langkah hari ini" },
  STEP_10000: { amount: 60, label: "Mencapai 10.000 langkah hari ini" },
  ELECTRICITY_EFFICIENT: { amount: 60, label: "Penggunaan listrik di bawah ambang batas hemat" },
  ELECTRICITY_VERY_EFFICIENT: { amount: 120, label: "Penggunaan listrik sangat efisien" },
  BILL_SCAN: { amount: 15, label: "Pindai struk listrik PLN (OCR)" },
  FOOTPRINT_LOG: { amount: 5, label: "Pencatatan jejak karbon harian" },
} as const;

export type SupportingSourceKey = keyof typeof SUPPORTING_ECOPOINT_SOURCES;

/** Starting balance for the demo account so judges can try a redemption immediately. */
export const DEMO_STARTING_ECOPOINTS = 500;

/** Level curve: level = floor(sqrt(lifetime / 100)) + 1. */
export function levelFromLifetime(lifetime: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, lifetime) / 100)) + 1);
}

export function pointsToNextLevel(lifetime: number): number {
  const level = levelFromLifetime(lifetime);
  return Math.max(0, level * level * 100 - lifetime);
}

export function formatEcoPoints(value: number): string {
  return `${Math.round(value).toLocaleString("id-ID")} EcoPoints`;
}
