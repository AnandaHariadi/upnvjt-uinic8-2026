"use client";

import { Award } from "lucide-react";
import { computeBadges } from "@/lib/badges";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useHydrated } from "@/hooks/useHydrated";
import Badge3DIcon from "@/components/common/Badge3DIcon";
import { cn } from "@/utils/cn";

export default function Achievements({ compact = false }: { compact?: boolean }) {
  const hydrated = useHydrated();
  const actions = useGreenActionStore((s) => s.actions);
  const challengesCompleted = useEcoPointsStore((s) => s.challengesCompleted);
  const badges = computeBadges({ actions: hydrated ? actions : [], challengesCompleted: hydrated ? challengesCompleted : 0 });
  const earned = badges.filter((b) => b.earned).length;
  const pct = Math.round((earned / badges.length) * 100);

  return (
    <section aria-labelledby="badges-heading" className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
      {/* Header Lencana */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0F3D2E] border border-emerald-100">
            <Award size={18} />
          </span>
          <div>
            <h2 id="badges-heading" className="text-base font-bold text-[#0F3D2E]">
              Koleksi Lencana Prestasi Hijau
            </h2>
            <p className="text-xs text-gray-500">Apresiasi resmi atas keaktifan aksi lingkungan Anda di Surabaya</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-[#0F3D2E]">
            {earned} dari {badges.length} Diraih
          </span>
        </div>
      </div>

      {/* Progress Bar Koleksi Lencana */}
      {!compact && (
        <div className="mb-5 rounded-xl border border-gray-100 bg-[#FAFCFB] p-3">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1.5">
            <span>Progres Koleksi Lencana</span>
            <span className="font-extrabold text-[#0F3D2E]">{pct}% Lengkap</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#15803D] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid Lencana */}
      <ul className={cn("grid gap-3.5", compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4")}>
        {badges.map((b) => (
          <li
            key={b.id}
            className={cn(
              "flex flex-col items-center rounded-2xl p-4 text-center transition-all",
              b.earned
                ? "border border-emerald-200/90 bg-gradient-to-b from-emerald-50/60 to-white shadow-xs hover:-translate-y-0.5 hover:shadow-md"
                : "border border-gray-100 bg-[#FAFCFB]"
            )}
            title={b.description}
          >
            <div className="relative flex items-center justify-center py-1">
              <Badge3DIcon id={b.id} earned={b.earned} size={compact ? 56 : 72} />
            </div>

            <span
              className={cn(
                "mt-2 text-xs font-bold leading-tight",
                b.earned ? "text-[#0F3D2E]" : "text-gray-700"
              )}
            >
              {b.name}
            </span>

            {/* Status & Keterangan Total Poin Milestone */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {b.earned ? (
                <>
                  <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Diraih
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#F0FAF4] border border-[#A8D5BA] px-2 py-0.5 text-[10px] font-bold text-[#2D5F3F]">
                    Syarat: {b.points.toLocaleString("id-ID")} Poin
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                    Progres: {b.current}/{b.target}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Butuh {b.points.toLocaleString("id-ID")} Poin
                  </span>
                </>
              )}
            </div>

            {!compact && (
              <p className="mt-1.5 text-[11px] leading-snug text-gray-500">
                {b.description}
              </p>
            )}

            <span className="sr-only">
              {b.earned ? "Lencana telah diraih" : `Terkunci, progres ${b.current} dari ${b.target}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
