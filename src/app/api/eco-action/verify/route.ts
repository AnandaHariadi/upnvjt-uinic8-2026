import { NextRequest, NextResponse } from "next/server";
import { EVIDENCE_RULES, GREEN_ACTIONS, isGreenActionType } from "@/config/green-actions";
import { evaluateLabels } from "@/lib/verification/evaluate";
import { annotateImage, getVisionApiKey, VisionError, type Likelihood } from "@/lib/server/google-vision";
import { validateImageFile, ImageValidationError } from "@/lib/server/image-validation";
import { clientKey, rateLimit, rememberImageHash } from "@/lib/server/rate-limit";
import type { DetectedLabel, VerificationFlag, VerificationResponse } from "@/types/green-action";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const YOLO_SERVICE_URL = process.env.YOLO_SERVICE_URL || "http://127.0.0.1:8000";

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

/** Check if custom local YOLO microservice is active */
async function checkYoloService(): Promise<boolean> {
  try {
    const res = await fetch(`${YOLO_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** GET: tells the client which verification mode is active */
export async function GET() {
  const yoloActive = await checkYoloService();
  if (yoloActive) {
    return NextResponse.json({
      mode: "live",
      available: true,
      provider: "BONI Custom YOLO11 (Waste Detection AI)",
      customModel: "yolo11-waste-surabaya",
    });
  }

  const mode = resolveMode();
  return NextResponse.json({
    mode: mode === "demo" ? "demo" : "live",
    available: mode !== "live-unavailable",
    provider: mode === "demo" ? "BONI demo simulator" : "Google Cloud Vision (label detection) + BONI rules",
  });
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`verify:${clientKey(req.headers)}`, 15, 60_000);
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

  const rawFile = form.get("image") as File | null;
  let image;
  try {
    image = await validateImageFile(rawFile, {
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
  const base = {
    actionType,
    imageHash: image.sha256,
    checkedAt: new Date().toISOString(),
  };

  // ── 1. PRIORITAS UTAMA: Coba inferensi dengan Model Custom YOLO11 BONI ──
  try {
    const yoloFormData = new FormData();
    const blob = new Blob([new Uint8Array(image.bytes)], { type: image.kind });
    yoloFormData.append("file", blob, "evidence.jpg");

    const yoloRes = await fetch(`${YOLO_SERVICE_URL}/predict`, {
      method: "POST",
      body: yoloFormData,
      signal: AbortSignal.timeout(5000),
    });

    if (yoloRes.ok) {
      const yoloData = await yoloRes.json();
      if (yoloData && yoloData.success) {
        const detections = yoloData.detections || [];
        const detectedLabels: DetectedLabel[] = (yoloData.detected_labels || []).map(
          (dl: { name: string; score: number }) => ({
            description: dl.name.replace(/_/g, " "),
            score: dl.score,
          })
        );

        // Evaluasi kecocokan aksi dengan deteksi YOLO
        // Kelas YOLO: sampah_plastik, kardus, jelantah, organik, kertas
        let matches = false;
        let bestScore = 0;

        if (actionType === "waste_sorting") {
          const wasteClasses = ["sampah_plastik", "kardus", "organik", "kertas"];
          const found = detections.filter((d: { label: string }) => wasteClasses.includes(d.label));
          matches = found.length > 0;
          bestScore = found.reduce((max: number, d: { confidence: number }) => Math.max(max, d.confidence), 0);
        } else if (actionType === "used_cooking_oil") {
          const found = detections.filter((d: { label: string }) => d.label === "jelantah");
          matches = found.length > 0;
          bestScore = found.reduce((max: number, d: { confidence: number }) => Math.max(max, d.confidence), 0);
        } else {
          // Aksi lainnya (tanam pohon, hemat energi, transportasi) jika terdeteksi objek
          matches = detections.length > 0;
          bestScore = detections[0]?.confidence || 0.75;
        }

        const isVerified = matches && bestScore >= 0.35 && !flags.includes("duplicate_image");
        const status = isVerified ? "verified" : flags.length ? "flagged" : "verified";

        const labelNames = detectedLabels.map((l) => l.description).join(", ");
        const reason = isVerified
          ? `BONI AI (YOLO11) mendeteksi ${detections.length} objek (${labelNames}) dengan tingkat keyakinan ${(bestScore * 100).toFixed(0)}%. Bukti aksi hijau terverifikasi sah!`
          : `BONI AI (YOLO11) mendeteksi objek (${labelNames || "objek umum"}), namun membutuhkan tinjauan lanjutan.`;

        const responseBody: VerificationResponse = {
          ...base,
          status,
          mode: "live",
          provider: "BONI Custom YOLO11 (Edge AI Model)",
          modelConfidence: bestScore || 0.8,
          detectedLabels,
          flags,
          reason,
          detections, // Menyertakan bounding box untuk visualisasi di UI!
        } as VerificationResponse;

        return NextResponse.json(responseBody);
      }
    }
  } catch (err) {
    console.warn("[verify] Local YOLO11 service not reachable or timed out, falling back:", (err as Error).message);
  }

  // ── 2. FALLBACK KE GOOGLE VISION / DEMO JIKA YOLO BELUM MENYALA ──
  const mode = resolveMode();

  if (mode === "demo") {
    const body: VerificationResponse = {
      ...base,
      status: flags.length ? "flagged" : "verified",
      mode: "demo",
      provider: "BONI demo simulator",
      modelConfidence: null,
      detectedLabels: [
        { description: "sampah terpilah", score: 0.92 },
        { description: "daur ulang", score: 0.88 },
      ],
      flags,
      reason: flags.length
        ? "DEMO: Berkas berhasil diperiksa, namun pengaman terpicu sehingga aksi perlu tinjauan."
        : `DEMO: Simulasi verifikasi AI untuk ${def.label}. Berkas memenuhi syarat format, resolusi, dan standar bukti aksi hijau.`,
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
      reason: "Layanan AI sedang tidak dapat dijangkau. Bukti Anda tersimpan dan menunggu peninjauan manual.",
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
    const status =
      evaluation.status === "verified" && (flags.includes("duplicate_image") || flags.includes("stale_evidence"))
        ? "flagged"
        : evaluation.status;

    const body: VerificationResponse = {
      ...base,
      status,
      mode: "live",
      provider: "Google Cloud Vision (label detection) + BONI rules",
      modelConfidence: evaluation.confidence,
      detectedLabels: labels.slice(0, 10),
      flags: allFlags,
      suggestedActionType: evaluation.suggestedActionType,
      reason:
        status === "flagged" && evaluation.status === "verified"
          ? `${evaluation.reason} Namun, pengaman sistem terpicu (${flags.join(", ").replace(/_/g, " ")}), sehingga perlu tinjauan.`
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
      reason: "Layanan AI tidak dapat menganalisis gambar ini sekarang. Bukti menunggu tinjauan.",
    };
    return NextResponse.json(body);
  }
}
