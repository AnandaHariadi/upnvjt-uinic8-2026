"use client";

import { GREEN_ACTIONS } from "@/config/green-actions";
import { findKecamatan } from "@/config/surabaya";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useHydrated } from "@/hooks/useHydrated";
import VerificationStatusBadge from "./VerificationStatusBadge";
import { GreenActionIcon } from "@/components/common/icons";

function when(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GreenActionHistory({ limit = 8 }: { limit?: number }) {
  const hydrated = useHydrated();
  const actions = useGreenActionStore((s) => s.actions);
  const items = hydrated ? actions.slice(0, limit) : [];

  return (
    <section aria-labelledby="history-heading" className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 id="history-heading" className="text-sm font-bold text-[#0F3D2E]">
          Riwayat Aksi Hijau
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {hydrated ? actions.length : 0} aksi tercatat
        </span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl bg-[#F9FAFB] px-4 py-8 text-center text-xs text-gray-500">
          Belum ada riwayat aksi. Lakukan verifikasi pertama Anda untuk mendapatkan EcoPoints.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((a) => {
            const def = GREEN_ACTIONS[a.actionType];
            const district = findKecamatan(a.location?.kecamatanId)?.name;
            const points = a.ecoPointsAwarded > 0 ? a.ecoPointsAwarded : def.ecoPoints;
            return (
              <li key={a.actionId} className="flex items-center gap-3 py-3">
                {a.evidenceThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL thumbnail
                  <img src={a.evidenceThumbnail} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0F3D2E]">
                    <GreenActionIcon type={a.actionType} size={20} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-800">
                      {def.labelId || def.label}
                    </span>
                    <VerificationStatusBadge status={a.verificationStatus} mode={a.verificationMode} />
                  </div>
                  <p className="truncate text-[11px] text-gray-500 mt-0.5">
                    {a.estimatedImpact.quantity} {a.estimatedImpact.unit}
                    {a.estimatedImpact.estimatedCo2eKg != null && `, est. ${a.estimatedImpact.estimatedCo2eKg} kg CO₂e`}
                    {district && `, ${district}`} · {when(a.timestamp)}
                  </p>
                </div>
                <span className="shrink-0 text-right text-xs font-extrabold text-[#1D9E75]">
                  +{points} poin
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
