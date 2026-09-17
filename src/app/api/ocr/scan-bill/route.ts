import { NextRequest, NextResponse } from "next/server";
import { DEMO_OCR_RESULT } from "@/lib/demo-ocr";
import { annotateImage, getVisionApiKey, VisionError } from "@/lib/server/google-vision";
import { validateImageFile, ImageValidationError } from "@/lib/server/image-validation";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/ocr/scan-bill: Electricity Bill OCR.
 * Extracts kWh usage and bill amount from a PLN bill photo with Google Cloud
 * Vision text detection. This is text extraction only; it is not green-action
 * verification. Falls back to a clearly labelled demo result when no Vision
 * key is configured (or AI_VERIFICATION_MODE=demo).
 */

const MAX_BYTES = 10 * 1024 * 1024;

/* ── Regex patterns for PLN bill fields ── */
const PATTERNS = {
  noPelanggan:   /(?:no\.?\s*pelanggan|id pelanggan|nomor pelanggan)[^\d]*(\d{10,13})/i,
  namaPelanggan: /(?:nama pelanggan|nama)[^\n:]*[:\s]+([A-Z][A-Z\s]{2,40})/i,
  bulanTagihan:  /(?:periode|bulan tagihan|tagihan bulan)[^\n:]*[:\s]+([A-Z]{3,}\s*\d{4}|\d{2}[/-]\d{4})/i,
  dayaVA:        /(?:daya|tarif daya)[^\d]*(\d[\d.]+\s*VA)/i,
  kwh:           /(?:pemakaian|penggunaan|stand|kwh)[^\d]*(\d[\d.,]+)\s*kwh/i,
  tagihan:       /(?:tagihan listrik|rp\.?\s*tagihan|jumlah tagihan|total)[^\d]*rp\.?\s*([\d.,]+)/i,
};

function extractValue(text: string, pattern: RegExp): string | undefined {
  return text.match(pattern)?.[1]?.trim();
}

function parseNumber(raw?: string, allowDecimal = false): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/\s/g, "");
  if (allowDecimal) {
    if (/^\d{1,3}(?:\.\d{3})*,\d+$/.test(cleaned)) {
      const normalized = cleaned.replace(/\./g, "").replace(",", ".");
      const val = parseFloat(normalized);
      return isNaN(val) ? undefined : val;
    }
    if (/^\d{1,3}(?:,\d{3})*\.\d+$/.test(cleaned)) {
      const normalized = cleaned.replace(/,/g, "");
      const val = parseFloat(normalized);
      return isNaN(val) ? undefined : val;
    }
    if (/^\d+[.,]\d{1,2}$/.test(cleaned)) {
      const normalized = cleaned.replace(",", ".");
      const val = parseFloat(normalized);
      return isNaN(val) ? undefined : val;
    }
  }
  const n = parseFloat(cleaned.replace(/[.,]/g, ""));
  return isNaN(n) ? undefined : n;
}

/** Heuristic completeness score of the extracted fields (0–100), not an OCR accuracy metric. */
function scoreConfidence(kwh?: number, tagihan?: number, noPelanggan?: string): number {
  let score = 0;
  if (kwh && kwh > 0 && kwh < 10000) score += 40;
  if (tagihan && tagihan > 1000) score += 35;
  if (noPelanggan && noPelanggan.length >= 10) score += 25;
  return score;
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(`ocr:${clientKey(req.headers)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, message: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let file: File | null;
  try {
    file = (await req.formData()).get("image") as File | null;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }

  let image;
  try {
    image = await validateImageFile(file, {
      maxBytes: MAX_BYTES,
      accepted: ["image/jpeg", "image/png", "image/webp"],
      minDimension: 200,
    });
  } catch (e) {
    const status = e instanceof ImageValidationError ? e.status : 400;
    const message = e instanceof ImageValidationError ? e.message : "The image could not be processed";
    return NextResponse.json({ success: false, message }, { status });
  }

  const forceDemo = (process.env.AI_VERIFICATION_MODE ?? "auto").toLowerCase() === "demo";
  if (forceDemo || !getVisionApiKey()) {
    await new Promise((r) => setTimeout(r, 900));
    return NextResponse.json({
      ...DEMO_OCR_RESULT,
      mode: "demo",
      message: "DEMO result. Google Vision is not configured, so sample bill data is returned.",
    });
  }

  try {
    const response = await annotateImage(
      image.bytes.toString("base64"),
      [{ type: "TEXT_DETECTION", maxResults: 1 }],
      { languageHints: ["id", "en"] }
    );

    const rawText = response.textAnnotations?.[0]?.description ?? "";
    if (!rawText) {
      return NextResponse.json({ success: false, message: "No text was detected in the image" }, { status: 422 });
    }

    const noPelangganRaw = extractValue(rawText, PATTERNS.noPelanggan);
    const kwhRaw = extractValue(rawText, PATTERNS.kwh);
    const tagihanRaw = extractValue(rawText, PATTERNS.tagihan);
    const kwh = parseNumber(kwhRaw, true);
    const tagihan = parseNumber(tagihanRaw, false);

    return NextResponse.json({
      success: true,
      mode: "live",
      kwh,
      tagihan,
      confidence: scoreConfidence(kwh, tagihan, noPelangganRaw),
      raw_text: rawText,
      data: {
        no_pelanggan: noPelangganRaw,
        nama_pelanggan: extractValue(rawText, PATTERNS.namaPelanggan),
        bulan_tagihan: extractValue(rawText, PATTERNS.bulanTagihan),
        daya_va: extractValue(rawText, PATTERNS.dayaVA),
        penggunaan_kwh: kwhRaw,
        tagihan_rp: tagihanRaw,
      },
    });
  } catch (e) {
    const status = e instanceof VisionError ? e.status : 500;
    console.error("[ocr] Vision error:", e instanceof Error ? e.message : "unknown");
    return NextResponse.json(
      { success: false, message: "Electricity bill OCR is temporarily unavailable. Please enter your usage manually." },
      { status }
    );
  }
}
