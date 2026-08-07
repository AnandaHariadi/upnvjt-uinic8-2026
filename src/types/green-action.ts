import type { GreenActionType } from "@/config/green-actions";

export type { GreenActionType };

/**
 * pending : submitted, awaiting a result
 * verified: evidence accepted
 * flagged : "Needs Review": could not be confidently verified, no EcoPoints yet
 * rejected: evidence does not sufficiently match the selected action
 */
export type VerificationStatus = "pending" | "verified" | "rejected" | "flagged";

/** live = a real AI provider analysed the image; demo = simulated, no analysis performed. */
export type VerificationMode = "live" | "demo";

export type VerificationFlag =
  | "duplicate_image"
  | "rate_limited"
  | "daily_limit_reached"
  | "action_mismatch"
  | "low_confidence"
  | "possible_screenshot"
  | "inappropriate_content"
  | "stale_evidence"
  | "outside_pilot_area"
  | "small_image"
  | "ai_unavailable";

export interface DetectedLabel {
  description: string;
  score: number;
}

export interface EstimatedImpact {
  metric: string;
  quantity: number;
  unit: string;
  /** Estimated CO₂e in kg, only where a sourced factor exists. */
  estimatedCo2eKg: number | null;
}

/** Structured response of POST /api/eco-action/verify. */
export interface VerificationResponse {
  status: Exclude<VerificationStatus, "pending">;
  mode: VerificationMode;
  provider: string;
  actionType: GreenActionType;
  /**
   * Model-reported label score for the best matching evidence (0–1).
   * This is NOT an empirically measured accuracy.
   */
  modelConfidence: number | null;
  reason: string;
  flags: VerificationFlag[];
  detectedLabels: DetectedLabel[];
  /** Action the image appears to show if it differs from the selected one. */
  suggestedActionType?: GreenActionType;
  imageHash: string;
  checkedAt: string;
}

export interface GreenActionLocation {
  /** Kecamatan the location was snapped to. Exact coordinates are not stored. */
  kecamatanId: string;
  precision: "district";
}

export interface GreenActionRecord {
  actionId: string;
  userId: string;
  actionType: GreenActionType;
  /** Small, EXIF-free thumbnail kept locally for the user's own history. */
  evidenceThumbnail?: string;
  evidenceHash: string;
  verificationStatus: VerificationStatus;
  verificationReason: string;
  verificationConfidence: number | null;
  verificationMode: VerificationMode;
  flags: VerificationFlag[];
  timestamp: string;
  location?: GreenActionLocation;
  estimatedImpact: EstimatedImpact;
  ecoPointsAwarded: number;
  sharedToCommunity?: boolean;
}
