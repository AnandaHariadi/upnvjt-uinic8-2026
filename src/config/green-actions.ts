/**
 * Green Action catalogue: the core of PACUL's verification loop.
 *
 * Each action defines:
 *   evidence requirement → what the AI looks for → impact metric → EcoPoints.
 *
 * EcoPoints values and daily limits are PROTOTYPE REWARD RULES chosen by the
 * team for the pilot, not scientifically derived values.
 */

import {
  estimateCo2FromAvoidedMotorcycleKm,
  estimateCo2FromKwh,
} from "./impact-factors";

export const GREEN_ACTION_TYPES = [
  "waste_sorting",
  "used_cooking_oil",
  "tree_planting",
  "energy_saving",
  "sustainable_transport",
] as const;

export type GreenActionType = (typeof GREEN_ACTION_TYPES)[number];

export interface GreenActionDefinition {
  type: GreenActionType;
  label: string;
  labelId: string;
  color: string;
  evidenceRequirement: string;
  /** Self-reported quantity that drives the impact estimate. */
  quantity: { label: string; unit: string; min: number; max: number; default: number; step: number };
  impactMetric: string;
  /** Prototype Reward Rule: EcoPoints for one verified submission (not scaled by quantity). */
  ecoPoints: number;
  /** Prototype fraud-mitigation rule: max verified submissions per day. */
  dailyLimit: number;
  /**
   * Keywords matched (case-insensitive substring) against AI image labels.
   * `strong` labels are direct evidence; `weak` labels only add support.
   */
  keywords: { strong: string[]; weak: string[] };
  /** Estimated CO₂e for a quantity, or null when no defensible factor exists. */
  estimateCo2Kg: (quantity: number) => number | null;
  sdgs: number[];
}

export const GREEN_ACTIONS: Record<GreenActionType, GreenActionDefinition> = {
  waste_sorting: {
    type: "waste_sorting",
    label: "Waste Sorting",
    labelId: "Pilah Sampah",
    color: "#10B981",
    evidenceRequirement:
      "Foto sampah rumah tangga yang sudah dipilah ke wadah atau kantong terpisah (organik, anorganik, daur ulang).",
    quantity: { label: "Sampah terpilah", unit: "kg", min: 0.1, max: 10, default: 1, step: 0.1 },
    impactMetric: "Estimasi sampah terpilah (kg)",
    ecoPoints: 40,
    dailyLimit: 2,
    keywords: {
      strong: ["recycling", "waste", "waste container", "garbage", "trash", "rubbish", "plastic bottle", "cardboard", "litter", "bin"],
      weak: ["bottle", "plastic", "paper", "packaging", "bag", "container", "can", "carton", "box"],
    },
    estimateCo2Kg: () => null,
    sdgs: [11, 12],
  },
  used_cooking_oil: {
    type: "used_cooking_oil",
    label: "Used Cooking Oil Collection",
    labelId: "Setor Minyak Jelantah",
    color: "#F59E0B",
    evidenceRequirement:
      "Foto minyak jelantah yang dikumpulkan dalam botol atau jeriken tertutup, siap disetor ke bank jelantah.",
    quantity: { label: "Minyak jelantah", unit: "L", min: 0.1, max: 5, default: 1, step: 0.1 },
    impactMetric: "Minyak jelantah diselamatkan dari saluran air (liter)",
    ecoPoints: 50,
    dailyLimit: 1,
    keywords: {
      strong: ["cooking oil", "vegetable oil", "oil", "jerrycan"],
      weak: ["bottle", "plastic bottle", "liquid", "container", "jar", "fluid", "drink", "amber", "glass bottle"],
    },
    estimateCo2Kg: () => null,
    sdgs: [12, 6],
  },
  tree_planting: {
    type: "tree_planting",
    label: "Tree Planting",
    labelId: "Tanam Pohon",
    color: "#059669",
    evidenceRequirement:
      "Foto bibit pohon atau tanaman pelindung yang baru ditanam langsung di tanah pekarangan atau fasilitas umum.",
    quantity: { label: "Pohon ditanam", unit: "pohon", min: 1, max: 10, default: 1, step: 1 },
    impactMetric: "Pohon ditanam (batang)",
    ecoPoints: 80,
    dailyLimit: 2,
    keywords: {
      strong: ["tree", "seedling", "sapling", "planting", "gardening", "soil", "plant"],
      weak: ["leaf", "grass", "shrub", "garden", "flowerpot", "houseplant", "groundcover", "vegetation", "terrestrial plant", "twig"],
    },
    // Young trees sequester very little in year one; we report count only.
    estimateCo2Kg: () => null,
    sdgs: [13, 15, 11],
  },
  energy_saving: {
    type: "energy_saving",
    label: "Energy Saving",
    labelId: "Hemat Energi",
    color: "#EAB308",
    evidenceRequirement:
      "Foto meteran listrik PLN, kWh meter prabayar, atau penggunaan lampu hemat energi LED.",
    quantity: { label: "Penghematan listrik", unit: "kWh", min: 0.5, max: 100, default: 5, step: 0.5 },
    impactMetric: "Estimasi pengurangan CO₂ dari penghematan listrik",
    ecoPoints: 40,
    dailyLimit: 1,
    keywords: {
      strong: ["electricity meter", "meter", "light bulb", "led", "gauge", "measuring instrument", "electricity"],
      weak: ["electronic device", "lighting", "switch", "display device", "electrical wiring", "electrical supply", "light fixture", "gadget", "number"],
    },
    estimateCo2Kg: (kwh) => estimateCo2FromKwh(kwh),
    sdgs: [7, 13],
  },
  sustainable_transport: {
    type: "sustainable_transport",
    label: "Sustainable Transportation",
    labelId: "Transportasi Rendah Emisi",
    color: "#2563EB",
    evidenceRequirement:
      "Foto bukti mobilitas hijau saat naik sepeda, jalan kaki, atau moda transportasi umum (Suroboyo Bus/WiraWiri).",
    quantity: { label: "Jarak tempuh", unit: "km", min: 0.5, max: 50, default: 3, step: 0.5 },
    impactMetric: "Estimasi pengurangan emisi CO₂e dibanding sepeda motor",
    ecoPoints: 30,
    dailyLimit: 3,
    keywords: {
      strong: ["bicycle", "bicycle wheel", "cycling", "bus", "public transport", "train", "walking", "pedestrian", "bicycle frame"],
      weak: ["footwear", "sidewalk", "road", "street", "vehicle", "transport", "wheel", "shoe", "helmet", "metro", "station"],
    },
    estimateCo2Kg: (km) => estimateCo2FromAvoidedMotorcycleKm(km),
    sdgs: [11, 13],
  },
};

export const GREEN_ACTION_LIST: GreenActionDefinition[] = GREEN_ACTION_TYPES.map((t) => GREEN_ACTIONS[t]);

export function isGreenActionType(value: unknown): value is GreenActionType {
  return typeof value === "string" && (GREEN_ACTION_TYPES as readonly string[]).includes(value);
}

/** Shared verification thresholds (applied to model-reported label scores). */
export const VERIFICATION_THRESHOLDS = {
  verify: 0.75,
  review: 0.5,
} as const;

/** Evidence file constraints, enforced on both client and server. */
export const EVIDENCE_RULES = {
  maxBytes: 5 * 1024 * 1024,
  acceptedMime: ["image/jpeg", "image/png", "image/webp"] as const,
  minDimension: 320,
  /** Minimum seconds between two submissions from the same user. */
  minIntervalSeconds: 60,
  /** Photos whose file timestamp is older than this are flagged for review. */
  maxEvidenceAgeHours: 72,
} as const;
