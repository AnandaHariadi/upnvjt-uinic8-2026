import "server-only";

/**
 * Best-effort, in-memory fixed-window rate limiter and duplicate-image memory.
 *
 * Prototype-grade fraud mitigation: state lives in the memory of a single
 * server instance and resets on restart / across serverless instances. A
 * production deployment should back this with a shared store (e.g. Redis).
 */

const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    prune(windows, now);
    return { allowed: true, retryAfterSec: 0 };
  }
  entry.count += 1;
  return { allowed: entry.count <= limit, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
}

const seenHashes = new Map<string, number>();
const HASH_TTL_MS = 24 * 3600_000;

/** Returns true if this exact image was already submitted to this server instance in the last 24 h. */
export function rememberImageHash(hash: string): boolean {
  const now = Date.now();
  const seenAt = seenHashes.get(hash);
  seenHashes.set(hash, now);
  if (seenHashes.size > 5000) {
    seenHashes.forEach((t, h) => {
      if (now - t > HASH_TTL_MS) seenHashes.delete(h);
    });
  }
  return seenAt !== undefined && now - seenAt < HASH_TTL_MS;
}

function prune(map: Map<string, { resetAt: number }>, now: number) {
  if (map.size < 5000) return;
  map.forEach((v, k) => {
    if (v.resetAt <= now) map.delete(k);
  });
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || headers.get("x-real-ip") || "anonymous";
}
