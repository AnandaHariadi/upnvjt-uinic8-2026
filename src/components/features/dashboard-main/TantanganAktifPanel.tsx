"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GreenActionIcon } from "@/components/common/icons";
import { useEcoActionStore, challengeDaysLeft, challengeProgressPercent } from "@/store/ecoAction.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function TantanganAktifPanel() {
  const hydrated = useHydrated();
  const challenges = useEcoActionStore((s) => s.challenges);
  const active = hydrated ? challenges.filter((c) => c.isJoined && !c.isCompleted) : [];

  return (
    <section aria-labelledby="dash-challenges-heading" className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="dash-challenges-heading" className="text-sm font-bold text-[#0F3D2E]">
          Tantangan Aksi Hijau
        </h2>
        <Link href="/dashboard/marketplace?tab=challenges" className="flex items-center gap-1 text-xs font-semibold text-[#1D9E75] hover:text-[#15803D] transition-colors">
          Semua Misi <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-6 text-center">
          <p className="text-xs text-gray-500">Belum ada tantangan aktif yang diikuti.</p>
          <Link href="/dashboard/marketplace?tab=challenges" className="text-xs font-bold text-[#1D9E75] hover:underline">
            Pilih dan ikuti misi baru →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {active.map((c) => {
            const pct = challengeProgressPercent(c);
            return (
              <li key={c.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-xs sm:text-sm font-semibold text-gray-800">
                      <GreenActionIcon type={c.actionType} size={14} className="shrink-0" />
                      {c.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {c.progress} dari {c.target} terverifikasi · sisa {challengeDaysLeft(c)} hari (+{c.ecoPointsReward} poin)
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-extrabold text-[#0F3D2E]">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={`${c.title} progress`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.iconColor }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
