"use client";

import { Trophy, Medal, Sparkles, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useHydrated } from "@/hooks/useHydrated";
import { makeInitials } from "@/utils/formatters";
import DataBadge from "@/components/common/DataBadge";
import { cn } from "@/utils/cn";

/** Illustrative peers for the prototype leaderboard (fictional names). */
const DEMO_PEERS = [
  { name: "Siti A.", kecamatan: "Tegalsari", points: 1540 },
  { name: "Rian H.", kecamatan: "Wonokromo", points: 1380 },
  { name: "Dewi L.", kecamatan: "Gubeng", points: 1240 },
  { name: "Budi S.", kecamatan: "Rungkut", points: 980 },
  { name: "Ayu R.", kecamatan: "Mulyorejo", points: 610 },
];

const MEDAL_STYLES = [
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", ring: "ring-amber-400/30", label: "Juara 1" },
  { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", ring: "ring-slate-400/30", label: "Juara 2" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", ring: "ring-orange-400/30", label: "Juara 3" },
];

export default function Leaderboard() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const lifetime = useEcoPointsStore((s) => s.lifetimeEarned);

  const rows = [
    ...DEMO_PEERS.map((p) => ({ ...p, isMe: false })),
    ...(hydrated && user ? [{ name: `${user.name} (Anda)`, kecamatan: user.kecamatan || "Wonokromo", points: lifetime, isMe: true }] : []),
  ]
    .sort((a, b) => b.points - a.points)
    .slice(0, 6);

  return (
    <section aria-labelledby="leaderboard-heading" className="flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
      {/* Header Papan Peringkat */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70">
            <Trophy size={18} />
          </span>
          <div>
            <h2 id="leaderboard-heading" className="text-base font-bold text-[#0F3D2E]">
              Papan Peringkat Warga Surabaya
            </h2>
            <p className="text-xs text-gray-500">Peringkat kontribusi berdasarkan akumulasi poin aksi lingkungan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
            Musim Oktober 2026
          </span>
          <DataBadge variant="demo" label="Data Simulasi" />
        </div>
      </div>

      {/* Daftar Peringkat Warga */}
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const isTop3 = i < 3;
          const medal = isTop3 ? MEDAL_STYLES[i] : null;

          return (
            <li
              key={r.name}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-all",
                r.isMe
                  ? "border border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-white ring-2 ring-emerald-500/20 shadow-xs"
                  : isTop3
                    ? "border border-gray-100 bg-[#FAFCFB]"
                    : "border border-transparent bg-white hover:bg-gray-50/60"
              )}
            >
              {/* Nomor Peringkat / Medali */}
              <div className="flex w-7 shrink-0 justify-center">
                {isTop3 ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow-xs border",
                      medal?.bg,
                      medal?.border,
                      medal?.text
                    )}
                  >
                    {i + 1}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500">{i + 1}</span>
                )}
              </div>

              {/* Avatar Initials */}
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                  r.isMe
                    ? "bg-[#0F3D2E] text-white shadow-xs"
                    : isTop3
                      ? "bg-emerald-100 text-[#0F3D2E]"
                      : "bg-gray-100 text-gray-600"
                )}
                aria-hidden="true"
              >
                {makeInitials(r.name)}
              </span>

              {/* Nama & Kecamatan */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("truncate text-sm", r.isMe ? "font-black text-[#0F3D2E]" : "font-bold text-gray-800")}>
                    {r.name}
                  </span>
                  {r.isMe && (
                    <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                      Profil Anda
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                  <MapPin size={10} className="shrink-0" />
                  <span>Kec. {r.kecamatan}</span>
                </div>
              </div>

              {/* Saldo Poin */}
              <div className="flex flex-col items-end shrink-0">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-black tracking-tight",
                    r.isMe
                      ? "bg-[#0F3D2E] text-white"
                      : "bg-[#F0FAF4] text-[#2D5F3F] border border-[#A8D5BA]/50"
                  )}
                >
                  {r.points.toLocaleString("id-ID")}
                </span>
                <span className="text-[9px] font-medium text-gray-400 mt-0.5">EcoPoints</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
