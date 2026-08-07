/**
 * Centralized environmental conversion factors.
 *
 * Every number used to turn an activity into an ESTIMATED CO₂e value lives
 * here, with its unit and source. PACUL never measures emissions directly :
 * all results derived from these factors must be labelled "estimated".
 */

export interface ImpactFactor {
  metric: string;
  unit: string;
  value: number;
  source: string;
  sourceUrl?: string;
  lastReviewed: string;
  notes?: string;
}

export const IMPACT_FACTORS = {
  gridElectricity: {
    metric: "Grid electricity emission factor (Jawa-Madura-Bali system)",
    unit: "kg CO₂ per kWh",
    value: 0.87,
    source:
      "Ministry of Energy and Mineral Resources (ESDM), Directorate General of Electricity: GHG emission factors of the electricity system",
    sourceUrl: "https://gatrik.esdm.go.id/frontend/download_index/?kode_category=emisi_pl",
    lastReviewed: "2026-09",
    notes:
      "Value carried over from the original PACUL implementation. Published JAMALI factors have ranged roughly 0.79–0.89 t CO₂/MWh depending on year and margin type; confirm against the latest ESDM edition before citing externally.",
  },
  motorcycleTravel: {
    metric: "Average motorcycle travel emissions (avoided when replaced by walking, cycling or public transport)",
    unit: "kg CO₂e per km",
    value: 0.114,
    source: "UK DESNZ Greenhouse gas reporting conversion factors, motorbike (average)",
    sourceUrl: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    lastReviewed: "2026-09",
    notes:
      "UK fleet average used as a proxy; typical Indonesian motorcycles are smaller, so this may overestimate. Counterfactual assumption: the trip would otherwise have been made by motorcycle.",
  },
  walkingStride: {
    metric: "Average walking stride length",
    unit: "m per step",
    value: 0.762,
    source: "Common pedometer default (2.5 ft stride); carried over from the Step Tracker implementation",
    lastReviewed: "2026-09",
    notes: "Individual stride length varies with height; used only to estimate distance.",
  },
} as const satisfies Record<string, ImpactFactor>;

export type ImpactFactorKey = keyof typeof IMPACT_FACTORS;

/** Estimated CO₂ from avoided grid electricity (kWh saved). */
export function estimateCo2FromKwh(kwh: number): number {
  return round(kwh * IMPACT_FACTORS.gridElectricity.value);
}

/** Estimated CO₂e avoided by replacing a motorcycle trip of `km`. */
export function estimateCo2FromAvoidedMotorcycleKm(km: number): number {
  return round(km * IMPACT_FACTORS.motorcycleTravel.value);
}

export function stepsToKm(steps: number): number {
  return round((steps * IMPACT_FACTORS.walkingStride.value) / 1000);
}

function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
