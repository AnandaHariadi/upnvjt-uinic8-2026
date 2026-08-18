export const CATEGORIES = ["Transportasi", "Energi", "Limbah", "Pangan"] as const;

export type Category = (typeof CATEGORIES)[number];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
