import { GREEN_ACTIONS, type GreenActionType } from "@/config/green-actions";
import { useAuthStore } from "@/store/auth.store";
import { useEcoActionStore, type ChallengeUpdate } from "@/store/ecoAction.store";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import type { GreenActionRecord, VerificationFlag, VerificationResponse } from "@/types/green-action";

export interface RecordInput {
  actionType: GreenActionType;
  quantity: number;
  response: VerificationResponse;
  evidenceHash: string;
  thumbnail?: string;
  kecamatanId?: string;
  outsidePilotArea?: boolean;
}

export interface RecordOutcome {
  record: GreenActionRecord;
  challengeUpdates: ChallengeUpdate[];
}

/**
 * Persist a verification result as the user's green-action record and apply
 * its consequences. EcoPoints are awarded ONLY for status "verified".
 */
export function recordGreenAction(input: RecordInput): RecordOutcome {
  const def = GREEN_ACTIONS[input.actionType];
  const quantity = clamp(input.quantity, def.quantity.min, def.quantity.max);
  const userId = String(useAuthStore.getState().user?.id ?? "anonymous");
  const flags: VerificationFlag[] = [...input.response.flags];
  if (input.outsidePilotArea) flags.push("outside_pilot_area");

  const verified = input.response.status === "verified";
  const record: GreenActionRecord = {
    actionId: `ga_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    actionType: input.actionType,
    evidenceThumbnail: input.thumbnail,
    evidenceHash: input.evidenceHash,
    verificationStatus: input.response.status,
    verificationReason: input.response.reason,
    verificationConfidence: input.response.modelConfidence,
    verificationMode: input.response.mode,
    flags,
    timestamp: new Date().toISOString(),
    location: input.kecamatanId ? { kecamatanId: input.kecamatanId, precision: "district" } : undefined,
    estimatedImpact: {
      metric: def.impactMetric,
      quantity,
      unit: def.quantity.unit,
      estimatedCo2eKg: def.estimateCo2Kg(quantity),
    },
    ecoPointsAwarded: verified ? def.ecoPoints : 0,
  };

  useGreenActionStore.getState().addAction(record);

  let challengeUpdates: ChallengeUpdate[] = [];
  if (verified) {
    const modeTag = record.verificationMode === "demo" ? " (simulasi)" : "";
    useEcoPointsStore.getState().earn(def.ecoPoints, "green_action", `Aksi Terverifikasi: ${def.labelId}${modeTag}`, record.actionId);
    challengeUpdates = useEcoActionStore.getState().recordVerifiedAction(input.actionType);
  }
  return { record, challengeUpdates };
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
