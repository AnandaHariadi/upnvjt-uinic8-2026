import { CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";
import type { VerificationMode, VerificationStatus } from "@/types/green-action";
import { cn } from "@/utils/cn";

export const STATUS_COPY: Record<VerificationStatus, { label: string; description: string; className: string; Icon: typeof CheckCircle2 }> = {
  verified: { label: "Terverifikasi", description: "Bukti aksi valid dan disetujui.", className: "bg-emerald-50 text-emerald-800 border border-emerald-200", Icon: CheckCircle2 },
  flagged: { label: "Perlu Tinjauan", description: "Foto memerlukan pengecekan tambahan.", className: "bg-amber-50 text-amber-800 border border-amber-200", Icon: ShieldAlert },
  rejected: { label: "Ditolak", description: "Bukti tidak memenuhi kriteria aksi.", className: "bg-red-50 text-red-700 border border-red-200", Icon: XCircle },
  pending: { label: "Menunggu", description: "Sedang dalam antrean verifikasi.", className: "bg-gray-50 text-gray-700 border border-gray-200", Icon: Clock },
};

export default function VerificationStatusBadge({
  status,
  size = "sm",
}: {
  status: VerificationStatus;
  mode?: VerificationMode;
  size?: "sm" | "md";
}) {
  const copy = STATUS_COPY[status] || STATUS_COPY.verified;
  const Icon = copy.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold",
        size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
        copy.className
      )}
    >
      <Icon size={size === "md" ? 13 : 11} aria-hidden="true" />
      {copy.label}
    </span>
  );
}

export const FLAG_COPY: Record<string, string> = {
  duplicate_image: "Foto ini sudah pernah diunggah sebelumnya.",
  rate_limited: "Terlalu banyak unggahan dalam waktu singkat.",
  daily_limit_reached: "Batas harian untuk aksi ini sudah tercapai.",
  action_mismatch: "Objek foto tidak sesuai dengan kategori aksi.",
  low_confidence: "Bukti visual kurang jelas untuk diverifikasi.",
  possible_screenshot: "Terdeteksi tangkapan layar (screenshot).",
  inappropriate_content: "Konten foto tidak pantas.",
  stale_evidence: "Foto diambil lebih dari 72 jam yang lalu.",
  outside_pilot_area: "Lokasi di luar wilayah Surabaya.",
  small_image: "Resolusi foto terlalu rendah.",
  ai_unavailable: "Layanan verifikasi sedang sibuk. Coba lagi nanti.",
};
