/**
 * Turns image labels from an AI vision model into a PACUL verification
 * decision. Pure and deterministic: same labels in → same decision out.
 */

import {
  GREEN_ACTIONS,
  GREEN_ACTION_TYPES,
  VERIFICATION_THRESHOLDS,
  type GreenActionType,
} from "@/config/green-actions";
import type { DetectedLabel, VerificationFlag, VerificationStatus } from "@/types/green-action";

const WEAK_WEIGHT = 0.6;
/** Labels that suggest a photo of a screen or document rather than a real scene. */
const SCREENSHOT_HINTS = ["screenshot", "web page", "website", "multimedia", "computer monitor", "display device", "font", "document"];

export interface ActionMatch {
  actionType: GreenActionType;
  /** Decision score: best weighted label score plus a small bonus for corroborating labels. */
  score: number;
  /** Best raw model score among matching labels: this is what the UI reports. */
  bestLabelScore: number;
  matchedLabels: string[];
}

function matches(label: string, keyword: string): boolean {
  // Whole-word match so "pan" does not match "panel", but "plastic bottle" matches "bottle".
  return new RegExp(`(^|\\b)${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\b|$)`, "i").test(label);
}

export function scoreAction(actionType: GreenActionType, labels: DetectedLabel[]): ActionMatch {
  const { strong, weak } = GREEN_ACTIONS[actionType].keywords;
  let best = 0;
  let bestRaw = 0;
  let supporting = 0;
  const matched: string[] = [];
  for (const l of labels) {
    const isStrong = strong.some((k) => matches(l.description, k));
    const isWeak = !isStrong && weak.some((k) => matches(l.description, k));
    if (!isStrong && !isWeak) continue;
    matched.push(l.description);
    const s = l.score * (isStrong ? 1 : WEAK_WEIGHT);
    if (s > best) best = s;
    if (l.score > bestRaw) bestRaw = l.score;
    supporting += 1;
  }
  // Small bonus for several independent supporting labels, capped at 1.
  const score = Math.min(1, best + Math.min(0.1, Math.max(0, supporting - 1) * 0.03));
  return { actionType, score: round(score), bestLabelScore: round(bestRaw), matchedLabels: matched.slice(0, 6) };
}

export interface EvaluationInput {
  selected: GreenActionType;
  labels: DetectedLabel[];
  unsafe: boolean;
}

export interface EvaluationResult {
  status: Exclude<VerificationStatus, "pending">;
  confidence: number;
  reason: string;
  flags: VerificationFlag[];
  suggestedActionType?: GreenActionType;
}

export function evaluateLabels({ selected, labels, unsafe }: EvaluationInput): EvaluationResult {
  const def = GREEN_ACTIONS[selected];
  if (unsafe) {
    return {
      status: "rejected",
      confidence: 0,
      reason: "The image was flagged as inappropriate content and cannot be used as evidence.",
      flags: ["inappropriate_content"],
    };
  }

  const own = scoreAction(selected, labels);
  const others = GREEN_ACTION_TYPES.filter((t) => t !== selected)
    .map((t) => scoreAction(t, labels))
    .sort((a, b) => b.score - a.score);
  const rival = others[0];

  const flags: VerificationFlag[] = [];
  const screenshotLike = labels.slice(0, 5).some((l) => SCREENSHOT_HINTS.some((h) => matches(l.description, h)) && l.score > 0.7);
  if (screenshotLike) flags.push("possible_screenshot");

  const top = labels.slice(0, 4).map((l) => l.description.toLowerCase()).join(", ") || "no recognisable objects";

  if (own.score >= VERIFICATION_THRESHOLDS.verify && !screenshotLike) {
    return {
      status: "verified",
      confidence: own.bestLabelScore,
      reason: `The image shows ${own.matchedLabels.slice(0, 3).join(", ").toLowerCase()}, which is consistent with ${def.label.toLowerCase()}.`,
      flags,
    };
  }

  // Clear mismatch: little evidence for the selected action, strong evidence for another.
  if (rival && rival.score >= VERIFICATION_THRESHOLDS.verify && own.score < VERIFICATION_THRESHOLDS.review) {
    flags.push("action_mismatch");
    return {
      status: "rejected",
      confidence: own.bestLabelScore,
      reason: `The image appears to show ${GREEN_ACTIONS[rival.actionType].label.toLowerCase()} (${rival.matchedLabels.slice(0, 2).join(", ").toLowerCase()}), not ${def.label.toLowerCase()}. Choose the matching action or upload new evidence.`,
      flags,
      suggestedActionType: rival.actionType,
    };
  }

  if (own.score >= VERIFICATION_THRESHOLDS.review || (own.score >= VERIFICATION_THRESHOLDS.verify && screenshotLike)) {
    flags.push("low_confidence");
    if (rival && rival.score > own.score) flags.push("action_mismatch");
    return {
      status: "flagged",
      confidence: own.bestLabelScore,
      reason: screenshotLike
        ? "The image looks like a screenshot or photo of a screen. It needs manual review before EcoPoints are awarded."
        : `Some supporting evidence was found (${own.matchedLabels.slice(0, 3).join(", ").toLowerCase()}), but not enough to verify automatically. The action is queued for review.`,
      flags,
    };
  }

  flags.push("low_confidence");
  return {
    status: "rejected",
    confidence: own.bestLabelScore,
    reason: `The evidence does not sufficiently match ${def.label.toLowerCase()}. Detected: ${top}. ${def.evidenceRequirement}`,
    flags,
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
