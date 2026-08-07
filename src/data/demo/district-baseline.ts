/**
 * DEMO DATA: synthetic district-level baseline for the Surabaya pilot.
 *
 * Generated deterministically (seeded by kecamatan id) so numbers are stable
 * across reloads and judging sessions. These are NOT real measurements or
 * municipal statistics.
 */

import { SURABAYA_KECAMATAN } from "@/config/surabaya";
import { GREEN_ACTION_TYPES, type GreenActionType } from "@/config/green-actions";

export interface DistrictBaseline {
  kecamatanId: string;
  verifiedActions: number;
  actionsByType: Record<GreenActionType, number>;
  estimatedCo2eKg: number;
  activeContributors: number;
  ecoPointsIssued: number;
  ecoPointsRedeemed: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEIGHTS: Record<GreenActionType, number> = {
  waste_sorting: 0.38,
  sustainable_transport: 0.24,
  used_cooking_oil: 0.16,
  energy_saving: 0.14,
  tree_planting: 0.08,
};

export const DISTRICT_BASELINE: DistrictBaseline[] = SURABAYA_KECAMATAN.map((k) => {
  const r = rng(hash(k.id));
  const total = Math.round(25 + r() * 160);
  const actionsByType = {} as Record<GreenActionType, number>;
  let assigned = 0;
  GREEN_ACTION_TYPES.forEach((t, i) => {
    const n = i === GREEN_ACTION_TYPES.length - 1 ? total - assigned : Math.round(total * WEIGHTS[t] * (0.7 + r() * 0.6));
    actionsByType[t] = Math.max(0, n);
    assigned += actionsByType[t];
  });
  const verifiedActions = Object.values(actionsByType).reduce((a, b) => a + b, 0);
  const ecoPointsIssued = Math.round(verifiedActions * (38 + r() * 14));
  return {
    kecamatanId: k.id,
    verifiedActions,
    actionsByType,
    // Only transport and energy actions carry a sourced CO₂e factor.
    estimatedCo2eKg: Math.round(actionsByType.sustainable_transport * 0.4 + actionsByType.energy_saving * 3.5),
    activeContributors: Math.max(3, Math.round(verifiedActions / (3 + r() * 2))),
    ecoPointsIssued,
    ecoPointsRedeemed: Math.round(ecoPointsIssued * (0.35 + r() * 0.3)),
  };
});

export const DEMO_DATASET_LABEL = "Demo dataset · synthetic, district-level";
