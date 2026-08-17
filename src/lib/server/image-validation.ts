import "server-only";
import { createHash } from "crypto";

export type ImageKind = "image/jpeg" | "image/png" | "image/webp";

export interface ValidatedImage {
  bytes: Buffer;
  kind: ImageKind;
  width: number;
  height: number;
  sha256: string;
}

export class ImageValidationError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

/** Detect the real image type from magic bytes (the client-sent MIME is not trusted). */
export function sniffImageKind(b: Buffer): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) return "image/png";
  if (b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

/** Read pixel dimensions from the file header without decoding the image. */
export function readImageSize(b: Buffer, kind: ImageKind): { width: number; height: number } | null {
  try {
    if (kind === "image/png") {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
    if (kind === "image/webp") {
      const chunk = b.toString("ascii", 12, 16);
      if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const bits = b.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
      return null;
    }
    // JPEG: walk segments until a Start-Of-Frame marker.
    let off = 2;
    while (off + 9 < b.length) {
      if (b[off] !== 0xff) { off++; continue; }
      const marker = b[off + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { off += 2; continue; }
      const len = b.readUInt16BE(off + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) return { height: b.readUInt16BE(off + 5), width: b.readUInt16BE(off + 7) };
      off += 2 + len;
    }
    return null;
  } catch {
    return null;
  }
}

export async function validateImageFile(
  file: File | null,
  rules: { maxBytes: number; accepted: readonly string[]; minDimension: number }
): Promise<ValidatedImage> {
  if (!file || typeof file === "string") throw new ImageValidationError("No image was uploaded.");
  if (file.size === 0) throw new ImageValidationError("The uploaded image is empty.");
  if (file.size > rules.maxBytes) {
    throw new ImageValidationError(`Image is too large (max ${Math.round(rules.maxBytes / 1024 / 1024)} MB).`, 413);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = sniffImageKind(bytes);
  if (!kind || !rules.accepted.includes(kind)) {
    throw new ImageValidationError("Unsupported file type. Please upload a JPG, PNG or WebP photo.", 415);
  }
  const size = readImageSize(bytes, kind);
  if (!size) throw new ImageValidationError("The image could not be read. Please try another photo.");
  if (Math.min(size.width, size.height) < rules.minDimension) {
    throw new ImageValidationError(
      `Image resolution is too low (${size.width}×${size.height}). Minimum is ${rules.minDimension}px on the shorter side.`
    );
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return { bytes, kind, ...size, sha256 };
}
