"use client";

import { useMemo } from "react";
import { SURABAYA_KECAMATAN, type Kecamatan } from "@/config/surabaya";
import { GREEN_ACTION_TYPES, type GreenActionType } from "@/config/green-actions";
import { DISTRICT_BASELINE } from "@/data/demo/district-baseline";
import { DEMO_MERCHANTS } from "@/data/demo/umkm-rewards";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useWasteReportStore, type WasteReport } from "@/store/wasteReport.store";
import { useHydrated } from "@/hooks/useHydrated";
import type { GreenActionRecord } from "@/types/green-action";

/**
 * District-level aggregation. Individual records are only ever counted into a
 * kecamatan; no per-person or per-household coordinates leave this layer.
 */
export interface DistrictStats {
  kecamatan: Kecamatan;
  verifiedActions: number;
  actionsByType: Record<GreenActionType, number>;
  estimatedCo2eKg: number;
  activeContributors: number;
  ecoPointsIssued: number;
  ecoPointsRedeemed: number;
  wasteReports: number;
  openWasteReports: number;
  criticalOpenReports: number;
  resolvedWasteReports: number;
  umkmPartners: number;
  /** Records from this device's user included in the totals. */
  yourActions: number;
}

export type DistrictMetric =
  | "verifiedActions"
  | "wasteReports"
  | "estimatedCo2eKg"
  | "activeContributors"
  | "ecoPointsIssued"
  | "umkmPartners";

export const METRIC_META: Record<DistrictMetric, { label: string; unit: string; color: string }> = {
  verifiedActions: { label: "Aksi Terverifikasi", unit: "aksi", color: "#2D5F3F" },
  wasteReports: { label: "Laporan Sampah", unit: "laporan", color: "#DC2626" },
  estimatedCo2eKg: { label: "Reduksi CO₂e (kg)", unit: "kg", color: "#0E7490" },
  activeContributors: { label: "Kontributor Aktif", unit: "warga", color: "#7C3AED" },
  ecoPointsIssued: { label: "EcoPoints Terbit", unit: "poin", color: "#B7791F" },
  umkmPartners: { label: "Mitra UMKM", unit: "mitra", color: "#DB2777" },
};

export function aggregateDistricts(actions: GreenActionRecord[], reports: WasteReport[]): DistrictStats[] {
  return SURABAYA_KECAMATAN.map((k) => {
    const base = DISTRICT_BASELINE.find((b) => b.kecamatanId === k.id)!;
    const mine = actions.filter(
      (a) => a.verificationStatus === "verified" && a.location?.kecamatanId === k.id && !a.evidenceHash.startsWith("demo-seed")
    );
    const actionsByType = { ...base.actionsByType };
    for (const a of mine) actionsByType[a.actionType] += 1;
    const districtReports = reports.filter((r) => r.kecamatanId === k.id);
    const open = districtReports.filter((r) => r.status === "reported" || r.status === "in_progress");
    return {
      kecamatan: k,
      verifiedActions: base.verifiedActions + mine.length,
      actionsByType,
      estimatedCo2eKg: Math.round(base.estimatedCo2eKg + mine.reduce((s, a) => s + (a.estimatedImpact.estimatedCo2eKg ?? 0), 0)),
      activeContributors: base.activeContributors + (mine.length > 0 ? 1 : 0),
      ecoPointsIssued: base.ecoPointsIssued + mine.reduce((s, a) => s + a.ecoPointsAwarded, 0),
      ecoPointsRedeemed: base.ecoPointsRedeemed,
      wasteReports: districtReports.length,
      openWasteReports: open.length,
      criticalOpenReports: open.filter((r) => r.severity === "critical").length,
      resolvedWasteReports: districtReports.filter((r) => r.status === "resolved").length,
      umkmPartners: DEMO_MERCHANTS.filter((m) => m.kecamatanId === k.id).length,
      yourActions: mine.length,
    };
  });
}

export function cityTotals(stats: DistrictStats[]) {
  const sum = (f: (d: DistrictStats) => number) => stats.reduce((s, d) => s + f(d), 0);
  const byType = Object.fromEntries(GREEN_ACTION_TYPES.map((t) => [t, sum((d) => d.actionsByType[t])])) as Record<GreenActionType, number>;
  return {
    verifiedActions: sum((d) => d.verifiedActions),
    estimatedCo2eKg: sum((d) => d.estimatedCo2eKg),
    activeContributors: sum((d) => d.activeContributors),
    ecoPointsIssued: sum((d) => d.ecoPointsIssued),
    ecoPointsRedeemed: sum((d) => d.ecoPointsRedeemed),
    wasteReports: sum((d) => d.wasteReports),
    openWasteReports: sum((d) => d.openWasteReports),
    resolvedWasteReports: sum((d) => d.resolvedWasteReports),
    umkmPartners: sum((d) => d.umkmPartners),
    actionsByType: byType,
  };
}

/** Live district stats combining the demo baseline with this device's stores. */
export function useDistrictStats(): DistrictStats[] {
  const hydrated = useHydrated();
  const actions = useGreenActionStore((s) => s.actions);
  const reports = useWasteReportStore((s) => s.reports);
  return useMemo(() => aggregateDistricts(hydrated ? actions : [], hydrated ? reports : []), [actions, reports, hydrated]);
}
