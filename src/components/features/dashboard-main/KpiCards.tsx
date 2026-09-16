"use client";

import Link from "next/link";
import { Leaf, ShieldCheck, Star, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEcoPointsLevel, useEcoPointsStore } from "@/store/ecoPoints.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useEcoActionStore } from "@/store/ecoAction.store";
import { useHydrated } from "@/hooks/useHydrated";

function Card({ href, Icon, color, label, value, sub }: { href: string; Icon: LucideIcon; color: string; label: string; value: string; sub: string }) {
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#1D9E75]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] sm:p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} style={{ color }} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-gray-500">{label}</span>
        <span className="block truncate text-xl font-extrabold text-[#0F3D2E] sm:text-2xl">{value}</span>
        <span className="block text-[11px] font-medium text-gray-500 mt-0.5">{sub}</span>
      </span>
    </Link>
  );
}

export default function KpiCards() {
  const hydrated = useHydrated();
  const balance = useEcoPointsStore((s) => s.balance);
  const { level, pointsToNextLevel } = useEcoPointsLevel();
  const actions = useGreenActionStore((s) => s.actions);
  const challenges = useEcoActionStore((s) => s.challenges);

  const verified = actions.filter((a) => a.verificationStatus === "verified");
  const pending = actions.filter((a) => a.verificationStatus === "flagged").length;
  const co2 = verified.reduce((s, a) => s + (a.estimatedImpact.estimatedCo2eKg ?? 0), 0);
  const kgSorted = verified.filter((a) => a.actionType === "waste_sorting").reduce((s, a) => s + a.estimatedImpact.quantity, 0);
  const active = challenges.filter((c) => c.isJoined && !c.isCompleted).length;
  const joined = challenges.filter((c) => c.isJoined).length;

  const v = (s: string) => (hydrated ? s : "...");

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <Card
        href="/dashboard/marketplace"
        Icon={Star}
        color="#B7791F"
        label="Saldo EcoPoints"
        value={v(balance.toLocaleString("id-ID"))}
        sub={hydrated ? `Level ${level} (kurang ${pointsToNextLevel} poin)` : " "}
      />
      <Card
        href="/dashboard/eco-action"
        Icon={ShieldCheck}
        color="#1D9E75"
        label="Aksi Hijau Terverifikasi"
        value={v(String(verified.length))}
        sub={hydrated ? (pending > 0 ? `${pending} menunggu verifikasi` : "Semua bukti valid") : " "}
      />
      <Card
        href="/dashboard/map"
        Icon={Leaf}
        color="#0E7490"
        label="Estimasi Reduksi Emisi"
        value={v(`${co2.toFixed(1)} kg CO₂e`)}
        sub={hydrated ? `${kgSorted.toFixed(1)} kg sampah terpilah` : " "}
      />
      <Card
        href="/dashboard/marketplace?tab=challenges"
        Icon={Target}
        color="#7C3AED"
        label="Tantangan Berjalan"
        value={v(String(active))}
        sub={hydrated ? `${joined - active} selesai dari ${joined} misi` : " "}
      />
    </div>
  );
}
