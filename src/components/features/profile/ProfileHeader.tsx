"use client";

import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useEcoPointsLevel, useEcoPointsStore } from "@/store/ecoPoints.store";
import { useHydrated } from "@/hooks/useHydrated";
import { makeInitials } from "@/utils/formatters";

export default function ProfileHeader() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const balance = useEcoPointsStore((s) => s.balance);
  const lifetime = useEcoPointsStore((s) => s.lifetimeEarned);
  const { level, pointsToNextLevel } = useEcoPointsLevel();

  if (!hydrated || !user) {
    return <div className="h-48 animate-pulse rounded-[14px] bg-[#2D5F3F]/20" aria-hidden="true" />;
  }

  const levelFloor = (level - 1) ** 2 * 100;
  const levelCeil = level ** 2 * 100;
  const pct = Math.min(100, Math.round(((lifetime - levelFloor) / Math.max(1, levelCeil - levelFloor)) * 100));
  const joined = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : null;

  return (
    <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#2D5F3F] to-[#1a3d27] p-5 text-white sm:p-7">
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] border-[#7AC74F] text-2xl font-bold"
            style={{ backgroundColor: user.avatarColor ?? "rgba(255,255,255,0.15)" }}
            aria-hidden="true"
          >
            {user.avatarInitials ?? makeInitials(user.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{user.name}</h1>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
              <MapPin size={13} aria-hidden="true" /> {user.kecamatan ? `${user.kecamatan}, ` : ""}Surabaya
            </p>
            <Link
              href="/dashboard/profile/edit"
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/50 px-4 py-1.5 text-sm font-medium hover:bg-white/10"
            >
              <Pencil size={13} aria-hidden="true" /> Edit Profil
            </Link>
          </div>
        </div>

        <div className="min-w-[240px] flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Tingkat Level EcoPoints</p>
          <p className="text-2xl font-bold">Level {level}</p>
          <p className="text-sm text-white/80">{pointsToNextLevel.toLocaleString("id-ID")} EcoPoints menuju level {level + 1}</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Progres level" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[#7AC74F]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-xs text-white/80">
            Saldo {balance.toLocaleString("id-ID")} · Total {lifetime.toLocaleString("id-ID")} EcoPoints{joined && ` · Bergabung ${joined}`}
          </p>
        </div>
      </div>
    </div>
  );
}
