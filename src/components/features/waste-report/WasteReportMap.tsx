"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG, useWasteReportStore,
  type WasteCategory, type WasteStatus,
} from "@/store/wasteReport.store";
import { findKecamatan } from "@/config/surabaya";
import { MapLoading } from "@/components/maps/MapLoading";
import DataBadge from "@/components/common/DataBadge";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/utils/cn";
import { WasteCategoryIcon } from "@/components/common/icons";

const WasteMapCanvas = dynamic(() => import("./WasteMapCanvas"), { ssr: false, loading: () => <MapLoading className="h-[360px] lg:h-[460px]" /> });

const STATUSES: WasteStatus[] = ["reported", "in_progress", "resolved", "rejected"];
const PAGE_SIZE = 10;

export default function WasteReportMap({ onDetail }: { onDetail: (id: string) => void }) {
  const hydrated = useHydrated();
  const reports = useWasteReportStore((s) => s.reports);
  const [status, setStatus] = useState<WasteStatus | "all">("all");
  const [category, setCategory] = useState<WasteCategory | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (hydrated ? reports : []).filter((r) => (status === "all" || r.status === status) && (category === "all" || r.category === category)),
    [reports, status, category, hydrated]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleStatusChange = (val: WasteStatus | "all") => {
    setStatus(val);
    setPage(1);
  };

  const handleCategoryChange = (val: WasteCategory | "all") => {
    setCategory(val);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.slice(0, 3).map((s) => (
          <span key={s} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: STATUS_CONFIG[s].color, backgroundColor: STATUS_CONFIG[s].bg }}>
            {STATUS_CONFIG[s].label}: {hydrated ? reports.filter((r) => r.status === s).length : 0}
          </span>
        ))}
        <DataBadge variant="demo" label="Termasuk Laporan Simulasi" className="ml-auto" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="wr-filter-status">Filter berdasarkan status</label>
        <select id="wr-filter-status" value={status} onChange={(e) => handleStatusChange(e.target.value as typeof status)} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
          <option value="all">Semua Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        <label className="sr-only" htmlFor="wr-filter-cat">Filter berdasarkan kategori</label>
        <select id="wr-filter-cat" value={category} onChange={(e) => handleCategoryChange(e.target.value as typeof category)} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
          <option value="all">Semua Kategori</option>
          {(Object.keys(CATEGORY_CONFIG) as WasteCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_CONFIG[c].labelId}</option>)}
        </select>
      </div>

      <WasteMapCanvas reports={filtered} onSelect={(r) => onDetail(r.id)} className="h-[360px] lg:h-[460px]" />
      <p className="text-[11px] text-gray-500">Tampilan publik: Koordinat titik dibulatkan radius ~100m demi menjaga privasi lingkungan.</p>

      <div className="flex items-center justify-between mt-2">
        <h3 className="text-sm font-bold text-[#1A1A1A]">{filtered.length} laporan ditemukan</h3>
        {totalPages > 1 && (
          <span className="text-xs text-gray-500">Halaman {page} dari {totalPages}</span>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {paginated.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onDetail(r.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-left hover:border-[#2D5F3F] transition-colors"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0FAF4] text-[#2D5F3F]"><WasteCategoryIcon category={r.category} size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#1A1A1A]">{r.title}</span>
                <span className="block text-[11px] text-gray-500">
                  {findKecamatan(r.kecamatanId)?.name} · {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · {r.upvotes} dukungan
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color: STATUS_CONFIG[r.status].color, backgroundColor: STATUS_CONFIG[r.status].bg }}>{STATUS_CONFIG[r.status].label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold")} style={{ color: SEVERITY_CONFIG[r.severity].color, backgroundColor: SEVERITY_CONFIG[r.severity].bg }}>{SEVERITY_CONFIG[r.severity].label}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Paginasi Rapi 10 Laporan per Halaman */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFCFB] px-4 py-2.5 text-xs text-gray-600 mt-2">
          <span className="font-medium">
            Menampilkan <strong className="text-[#0F3D2E]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> dari <strong className="text-[#0F3D2E]">{filtered.length}</strong> laporan
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Sebelumnya
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pNum = idx + 1;
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      setPage(pNum);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className={cn(
                      "h-7 w-7 rounded-lg text-xs font-bold transition-all",
                      page === pNum
                        ? "bg-[#0F3D2E] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
