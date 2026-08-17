import { NextRequest, NextResponse } from "next/server";
import { EVIDENCE_RULES, GREEN_ACTIONS, isGreenActionType } from "@/config/green-actions";
import { evaluateLabels } from "@/lib/verification/evaluate";
import { annotateImage, getVisionApiKey, VisionError, type Likelihood } from "@/lib/server/google-vision";
import { validateImageFile, ImageValidationError } from "@/lib/server/image-validation";
import { clientKey, rateLimit, rememberImageHash } from "@/lib/server/rate-limit";
import type { DetectedLabel, VerificationFlag, VerificationResponse } from "@/types/green-action";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/eco-action/verify
 *
 * multipart/form-data:
 *   image      : evidence photo (JPEG/PNG/WebP, ≤ 5 MB, ≥ 320 px)
 *   actionType : one of GREEN_ACTION_TYPES
 *   capturedAt : optional ISO timestamp / epoch ms of the photo file
 *
 * Mode (env AI_VERIFICATION_MODE):
 *   auto (default): live Google Vision analysis if GOOGLE_VISION_API_KEY is set, otherwise demo
 *   live          : always live; returns "Needs Review" if the key/API is unavailable
 *   demo          : deterministic simulated result, clearly labelled, no analysis performed
 */

type Mode = "auto" | "live" | "demo";

function resolveMode(): "live" | "demo" | "live-unavailable" {
  const configured = (process.env.AI_VERIFICATION_MODE ?? "auto").toLowerCase() as Mode;
  const hasKey = !!getVisionApiKey();
  if (configured === "demo") return "demo";
  if (configured === "live") return hasKey ? "live" : "live-unavailable";
  return hasKey ? "live" : "demo";
}

const UNSAFE: Likelihood[] = ["LIKELY", "VERY_LIKELY"];

function error(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** GET: tells the client which verification mode is active (never exposes secrets). */
export async function GET() {
  const mode = resolveMode();
  return NextResponse.json({
    mode: mode === "demo" ? "demo" : "live",
    available: mode !== "live-unavailable",
    provider: mode === "demo" ? "PACUL demo simulator" : "Google Cloud Vision (label detection) + PACUL rules",
  });
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`verify:${clientKey(req.headers)}`, 10, 60_000);
  if (!limit.allowed) {
    return error("Too many verification requests. Please wait a moment and try again.", 429, {
      retryAfterSec: limit.retryAfterSec,
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error("Invalid request. Expected multipart form data.", 400);
  }

  const actionType = form.get("actionType");
  if (!isGreenActionType(actionType)) return error("Unknown or missing action type.", 400);

  let image;
  try {
    image = await validateImageFile(form.get("image") as File | null, {
      maxBytes: EVIDENCE_RULES.maxBytes,
      accepted: EVIDENCE_RULES.acceptedMime,
      minDimension: EVIDENCE_RULES.minDimension,
    });
  } catch (e) {
    if (e instanceof ImageValidationError) return error(e.message, e.status);
    return error("The image could not be processed.", 400);
  }

  const flags: VerificationFlag[] = [];
  if (rememberImageHash(image.sha256)) flags.push("duplicate_image");

  const capturedRaw = form.get("capturedAt");
  if (typeof capturedRaw === "string" && capturedRaw) {
    const captured = Number.isFinite(Number(capturedRaw)) ? Number(capturedRaw) : Date.parse(capturedRaw);
    if (Number.isFinite(captured) && Date.now() - captured > EVIDENCE_RULES.maxEvidenceAgeHours * 3600_000) {
      flags.push("stale_evidence");
    }
  }

  const def = GREEN_ACTIONS[actionType];
  const mode = resolveMode();
  const base = {
    actionType,
    imageHash: image.sha256,
    checkedAt: new Date().toISOString(),
  };

  if (mode === "demo") {
    const body: VerificationResponse = {
      ...base,
      status: flags.length ? "flagged" : "verified",
      mode: "demo",
      provider: "PACUL demo simulator",
      modelConfidence: null,
      detectedLabels: [],
      flags,
      reason: flags.length
        ? "DEMO: The file passed type, size and resolution checks, but a safeguard was triggered, so the action needs review."
        : `DEMO: Simulated verification for ${def.label}. The file passed type, size and resolution checks; no AI analysis was performed because no AI provider is configured.`,
    };
    return NextResponse.json(body);
  }

  if (mode === "live-unavailable") {
    const body: VerificationResponse = {
      ...base,
      status: "flagged",
      mode: "live",
      provider: "Google Cloud Vision",
      modelConfidence: null,
      detectedLabels: [],
      flags: [...flags, "ai_unavailable"],
      reason: "AI verification is currently unavailable. Your evidence was saved and needs review. Please try again later.",
    };
    return NextResponse.json(body);
  }

  try {
    const result = await annotateImage(image.bytes.toString("base64"), [
      { type: "LABEL_DETECTION", maxResults: 20 },
      { type: "OBJECT_LOCALIZATION", maxResults: 10 },
      { type: "SAFE_SEARCH_DETECTION" },
    ]);

    const labelMap = new Map<string, DetectedLabel>();
    for (const l of result.labelAnnotations ?? []) labelMap.set(l.description.toLowerCase(), { description: l.description, score: l.score });
    for (const o of result.localizedObjectAnnotations ?? []) {
      const key = o.name.toLowerCase();
      const prev = labelMap.get(key);
      if (!prev || prev.score < o.score) labelMap.set(key, { description: o.name, score: o.score });
    }
    const labels = Array.from(labelMap.values()).sort((a, b) => b.score - a.score);
    const safe = result.safeSearchAnnotation;
    const unsafe = !!safe && (UNSAFE.includes(safe.adult ?? "UNKNOWN") || UNSAFE.includes(safe.violence ?? "UNKNOWN"));

    const evaluation = evaluateLabels({ selected: actionType, labels, unsafe });
    const allFlags = Array.from(new Set([...flags, ...evaluation.flags]));
    // Safeguard flags downgrade an automatic approval to manual review.
    const status =
      evaluation.status === "verified" && (flags.includes("duplicate_image") || flags.includes("stale_evidence"))
        ? "flagged"
        : evaluation.status;

    const body: VerificationResponse = {
      ...base,
      status,
      mode: "live",
      provider: "Google Cloud Vision (label detection) + PACUL rules",
      modelConfidence: evaluation.confidence,
      detectedLabels: labels.slice(0, 10),
      flags: allFlags,
      suggestedActionType: evaluation.suggestedActionType,
      reason:
        status === "flagged" && evaluation.status === "verified"
          ? `${evaluation.reason} However, a safeguard was triggered (${flags.join(", ").replace(/_/g, " ")}), so it needs review.`
          : evaluation.reason,
    };
    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof VisionError ? e.message : "Unexpected verification error";
    console.error("[verify] AI provider error:", message);
    const body: VerificationResponse = {
      ...base,
      status: "flagged",
      mode: "live",
      provider: "Google Cloud Vision",
      modelConfidence: null,
      detectedLabels: [],
      flags: [...flags, "ai_unavailable"],
      reason: "The AI service could not analyse this image right now. The action needs review. Please try again in a moment.",
    };
    return NextResponse.json(body);
  }
}
