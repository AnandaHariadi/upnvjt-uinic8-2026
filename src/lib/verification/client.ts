"use client";

import { EVIDENCE_RULES, GREEN_ACTIONS, type GreenActionType } from "@/config/green-actions";
import { isInsideSurabaya, nearestKecamatan } from "@/config/surabaya";
import type { GreenActionRecord, VerificationResponse } from "@/types/green-action";

export interface PreparedEvidence {
  /** Re-encoded JPEG (max 1600 px, EXIF/GPS metadata stripped by the canvas). */
  upload: Blob;
  previewUrl: string;
  thumbnail: string;
  /** SHA-256 of the original file bytes, used for duplicate detection. */
  hash: string;
  width: number;
  height: number;
  capturedAt: number;
}

export class EvidenceError extends Error {}

const MAX_EDGE = 1600;
const THUMB_EDGE = 200;
/** Original files may be larger than the upload limit because they are re-encoded before upload. */
const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new EvidenceError("Format gambar tidak didukung browser Anda. Gunakan foto JPG, PNG, atau WebP."));
    img.src = url;
  });
}

function draw(img: HTMLImageElement, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new EvidenceError("Pemrosesan gambar tidak didukung pada perangkat ini.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new EvidenceError("Gagal memproses gambar bukti."))), "image/jpeg", quality)
  );
}

export async function prepareEvidence(file: File | undefined | null): Promise<PreparedEvidence> {
  if (!file) throw new EvidenceError("Silakan ambil atau pilih foto bukti terlebih dahulu.");
  if (file.size === 0) throw new EvidenceError("File foto yang dipilih kosong.");
  if (!file.type.startsWith("image/")) throw new EvidenceError("Format file tidak didukung. Unggah foto berekstensi JPG, PNG, atau WebP.");
  if (file.size > MAX_ORIGINAL_BYTES) throw new EvidenceError("Ukuran foto terlalu besar (maksimal 20 MB sebelum kompresi).");

  const original = await file.arrayBuffer();
  const hash = await sha256Hex(original);
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    if (Math.min(img.naturalWidth, img.naturalHeight) < EVIDENCE_RULES.minDimension) {
      throw new EvidenceError(
        `Resolusi foto terlalu rendah (${img.naturalWidth}×${img.naturalHeight}px). Minimal ${EVIDENCE_RULES.minDimension}px pada sisi terpendek.`
      );
    }
    const main = draw(img, MAX_EDGE);
    const upload = await toBlob(main, 0.85);
    if (upload.size > EVIDENCE_RULES.maxBytes) throw new EvidenceError("Foto masih terlalu besar setelah dikompresi. Silakan gunakan foto lain.");
    const thumbnail = draw(img, THUMB_EDGE).toDataURL("image/jpeg", 0.6);
    return {
      upload,
      previewUrl: URL.createObjectURL(upload),
      thumbnail,
      hash,
      width: main.width,
      height: main.height,
      capturedAt: file.lastModified || Date.now(),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Client-side fraud-mitigation checks against the user's own history, run
 * before anything is uploaded. Returns a human-readable reason to block, or null.
 */
export function preSubmitCheck(
  actionType: GreenActionType,
  hash: string,
  history: GreenActionRecord[]
): string | null {
  if (history.some((a) => a.evidenceHash === hash)) {
    return "Foto bukti ini sudah pernah diunggah sebelumnya. Setiap aksi memerlukan foto bukti baru.";
  }
  const last = history[0];
  if (last) {
    const since = (Date.now() - new Date(last.timestamp).getTime()) / 1000;
    if (since < EVIDENCE_RULES.minIntervalSeconds) {
      return `Mohon tunggu ${Math.ceil(EVIDENCE_RULES.minIntervalSeconds - since)} detik sebelum mengirim verifikasi aksi berikutnya.`;
    }
  }
  const def = GREEN_ACTIONS[actionType];
  const today = new Date().toDateString();
  const todayCount = history.filter(
    (a) =>
      a.actionType === actionType &&
      a.verificationStatus !== "rejected" &&
      new Date(a.timestamp).toDateString() === today
  ).length;
  if (todayCount >= def.dailyLimit) {
    return `Batas harian untuk ${def.labelId} sudah tercapai (${def.dailyLimit} kali per hari). Coba lagi besok.`;
  }
  return null;
}

export async function requestVerification(
  evidence: PreparedEvidence,
  actionType: GreenActionType
): Promise<VerificationResponse> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new EvidenceError("Perangkat Anda sedang offline. Sambungkan ke internet untuk memverifikasi aksi.");
  }
  const form = new FormData();
  form.append("image", evidence.upload, "evidence.jpg");
  form.append("actionType", actionType);
  form.append("capturedAt", String(evidence.capturedAt));

  let res: Response;
  try {
    res = await fetch("/api/eco-action/verify", { method: "POST", body: form });
  } catch {
    throw new EvidenceError("Gangguan jaringan. Layanan verifikasi tidak dapat dihubungi, silakan coba lagi.");
  }
  const data = (await res.json().catch(() => null)) as (VerificationResponse & { error?: string }) | null;
  if (!res.ok || !data || data.error) {
    throw new EvidenceError(data?.error ?? "Verifikasi gagal diproses. Silakan coba lagi.");
  }
  return data;
}

export type LocationResult =
  | { ok: true; kecamatanId: string; kecamatanName: string; inside: boolean }
  | { ok: false; reason: string };

/** Ask for the device location once and immediately snap it to a kecamatan. Exact coordinates are discarded. */
export function getDistrictLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, reason: "Layanan lokasi tidak didukung pada peramban ini." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const k = nearestKecamatan(latitude, longitude);
        resolve({ ok: true, kecamatanId: k.id, kecamatanName: k.name, inside: isInsideSurabaya(latitude, longitude) });
      },
      (err) =>
        resolve({
          ok: false,
          reason: err.code === err.PERMISSION_DENIED ? "Akses lokasi ditolak. Anda tetap dapat melanjutkan verifikasi." : "Lokasi tidak dapat ditentukan.",
        }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  });
}
