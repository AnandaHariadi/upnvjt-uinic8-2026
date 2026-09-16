"use client";

import { useMemo, useState } from "react";
import { METRIC_META, type DistrictMetric, type DistrictStats } from "@/lib/impact-aggregation";
import { cn } from "@/utils/cn";

const COLUMNS: DistrictMetric[] = ["verifiedActions", "wasteReports", "estimatedCo2eKg", "activeContributors", "ecoPointsIssued", "umkmPartners"];
const PAGE_SIZE = 10;

/** Accessible tabular alternative to the map with clean 10-item pagination. */
export default function DistrictTable({
  stats,
  selectedId,
  onSelect,
  dark = false,
}: {
  stats: DistrictStats[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dark?: boolean;
}) {
  const [sortKey, setSortKey] = useState<DistrictMetric>("verifiedActions");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () => [...stats].sort((a, b) => b[sortKey] - a[sortKey]),
    [stats, sortKey]
  );

  const totalPages = Math.ceil(rows.length / PAGE_SIZE) || 1;
  const paginatedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  const handleSort = (key: DistrictMetric) => {
    setSortKey(key);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className={cn("w-full min-w-[720px] text-left text-xs", dark ? "text-gray-200" : "text-gray-700")}>
          <caption className="sr-only">Statistik kecamatan Surabaya (data simulasi). Diurutkan berdasarkan {METRIC_META[sortKey].label}.</caption>
          <thead>
            <tr className={cn("border-b", dark ? "border-white/10" : "border-[#E5E7EB]")}>
              <th scope="col" className="py-2.5 pr-3 font-bold">Kecamatan</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">Wilayah</th>
              {COLUMNS.map((c) => (
                <th key={c} scope="col" aria-sort={sortKey === c ? "descending" : "none"} className="py-2.5 pr-3 text-right font-bold">
                  <button
                    type="button"
                    onClick={() => handleSort(c)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100/60 transition-colors",
                      sortKey === c && "text-[#0F3D2E] font-black underline underline-offset-4 decoration-[#1D9E75] decoration-2"
                    )}
                  >
                    {METRIC_META[c].label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((d) => (
              <tr
                key={d.kecamatan.id}
                className={cn(
                  "border-b transition-colors",
                  dark ? "border-white/5 hover:bg-white/5" : "border-[#F3F4F6] hover:bg-gray-50/70",
                  d.kecamatan.id === selectedId && (dark ? "bg-white/10" : "bg-[#F0FAF4] font-semibold")
                )}
              >
                <th scope="row" className="py-2.5 pr-3 font-semibold">
                  {onSelect ? (
                    <button type="button" onClick={() => onSelect(d.kecamatan.id)} className="text-left hover:text-[#1D9E75] hover:underline">
                      {d.kecamatan.name}
                    </button>
                  ) : (
                    d.kecamatan.name
                  )}
                </th>
                <td className="py-2.5 pr-3">{d.kecamatan.region}</td>
                {COLUMNS.map((c) => (
                  <td key={c} className="py-2.5 pr-3 text-right tabular-nums">{d[c].toLocaleString("id-ID")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginasi Rapi 10 Data per Halaman */}
      {totalPages > 1 && (
        <div className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs",
          dark ? "border-white/10 bg-white/5 text-gray-300" : "border-[#E5E7EB] bg-[#FAFCFB] text-gray-600"
        )}>
          <span className="font-medium">
            Menampilkan data <strong className={dark ? "text-white" : "text-[#0F3D2E]"}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)}</strong> dari <strong className={dark ? "text-white" : "text-[#0F3D2E]"}>{rows.length}</strong> kecamatan
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                dark ? "border-white/10 hover:bg-white/10" : "border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700"
              )}
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
                    onClick={() => setPage(pNum)}
                    className={cn(
                      "h-7 w-7 rounded-lg text-xs font-bold transition-all",
                      page === pNum
                        ? "bg-[#0F3D2E] text-white shadow-xs"
                        : dark
                          ? "text-gray-300 hover:bg-white/10"
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                dark ? "border-white/10 hover:bg-white/10" : "border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700"
              )}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
