import "server-only";

/**
 * Minimal Google Cloud Vision REST client shared by the OCR and green-action
 * verification routes. The API key is read server-side only and sent in the
 * `x-goog-api-key` header so it never appears in URLs or logs.
 */

const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";
const TIMEOUT_MS = 15_000;

export type VisionFeature =
  | "TEXT_DETECTION"
  | "LABEL_DETECTION"
  | "OBJECT_LOCALIZATION"
  | "SAFE_SEARCH_DETECTION";

export type Likelihood = "UNKNOWN" | "VERY_UNLIKELY" | "UNLIKELY" | "POSSIBLE" | "LIKELY" | "VERY_LIKELY";

export interface VisionAnnotateResponse {
  textAnnotations?: Array<{ description: string }>;
  labelAnnotations?: Array<{ description: string; score: number }>;
  localizedObjectAnnotations?: Array<{ name: string; score: number }>;
  safeSearchAnnotation?: { adult?: Likelihood; violence?: Likelihood; racy?: Likelihood };
  error?: { message: string };
}

export class VisionError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

export function getVisionApiKey(): string | null {
  const key = process.env.GOOGLE_VISION_API_KEY?.trim();
  return key ? key : null;
}

export async function annotateImage(
  imageBase64: string,
  features: Array<{ type: VisionFeature; maxResults?: number }>,
  imageContext?: Record<string, unknown>
): Promise<VisionAnnotateResponse> {
  const key = getVisionApiKey();
  if (!key) throw new VisionError("Google Vision API key is not configured.", 503);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(VISION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ requests: [{ image: { content: imageBase64 }, features, imageContext }] }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      let message = `Vision API returned HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body.error?.message) message = body.error.message;
      } catch {
        /* keep generic message */
      }
      throw new VisionError(message, 502);
    }
    const data = (await res.json()) as { responses?: VisionAnnotateResponse[] };
    const first = data.responses?.[0];
    if (!first) throw new VisionError("Vision API returned an empty response.");
    if (first.error) throw new VisionError(first.error.message, 422);
    return first;
  } catch (err) {
    if (err instanceof VisionError) throw err;
    if ((err as Error).name === "AbortError") throw new VisionError("Vision API request timed out.", 504);
    throw new VisionError("Could not reach the Vision API.");
  } finally {
    clearTimeout(timer);
  }
}
