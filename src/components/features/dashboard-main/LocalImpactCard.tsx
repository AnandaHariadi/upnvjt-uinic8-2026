"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { findKecamatan } from "@/config/surabaya";
import { cityTotals, useDistrictStats } from "@/lib/impact-aggregation";
import { useAuthStore } from "@/store/auth.store";
import DataBadge from "@/components/common/DataBadge";
import { useHydrated } from "@/hooks/useHydrated";

export default function LocalImpactCard() {
  const stats = useDistrictStats();
  const totals = cityTotals(stats);
  const hydrated = useHydrated();
  const kecamatanName = useAuthStore((s) => s.user?.kecamatan);
  const userKecamatan = hydrated ? findKecamatan(kecamatanName) : undefined;
  const mine = stats.find((d) => d.kecamatan.id === userKecamatan?.id);
  const rank = mine ? [...stats].sort((a, b) => b.verifiedActions - a.verifiedActions).findIndex((d) => d === mine) + 1 : null;

  return (
    <section aria-labelledby="local-impact-heading" className="flex flex-col rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="local-impact-heading" className="text-sm font-bold text-[#1A1A1A]">Local impact · Surabaya</h2>
        <DataBadge variant="demo" />
      </div>
      {mine ? (
        <div className="mb-3 rounded-lg bg-[#F0FAF4] p-3">
          <p className="flex items-center gap-1 text-xs font-semibold text-[#2D5F3F]"><MapPin size={12} aria-hidden="true" /> Your district: {mine.kecamatan.name}</p>
          <p className="mt-1 text-sm text-gray-700">
            <strong>{mine.verifiedActions}</strong> verified actions · <strong>{mine.openWasteReports}</strong> open waste reports · rank <strong>#{rank}</strong> of 31
          </p>
        </div>
      ) : (
        <p className="mb-3 text-xs text-gray-500">Set your kecamatan in your profile to see district statistics.</p>
      )}
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-[11px] text-gray-500">Verified actions (city)</dt><dd className="font-bold">{totals.verifiedActions.toLocaleString("en-US")}</dd></div>
        <div><dt className="text-[11px] text-gray-500">Est. CO₂e avoided</dt><dd className="font-bold">{totals.estimatedCo2eKg.toLocaleString("en-US")} kg</dd></div>
        <div><dt className="text-[11px] text-gray-500">Active contributors</dt><dd className="font-bold">{totals.activeContributors.toLocaleString("en-US")}</dd></div>
        <div><dt className="text-[11px] text-gray-500">Waste reports resolved</dt><dd className="font-bold">{totals.resolvedWasteReports}/{totals.wasteReports}</dd></div>
      </dl>
      <Link href="/dashboard/map" className="mt-auto pt-4 text-sm font-semibold text-[#2D5F3F] hover:underline">Open the Local Impact Map →</Link>
    </section>
  );
}
