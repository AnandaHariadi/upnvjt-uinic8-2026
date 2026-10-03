"use client";

import { useState } from "react";
import PageWrapper from "@/components/common/PageWrapper";
import WasteReportMap from "@/components/features/waste-report/WasteReportMap";
import CreateWasteReport from "@/components/features/waste-report/CreateWasteReport";
import ReportDetailModal from "@/components/features/waste-report/ReportDetailModal";
import { cn } from "@/utils/cn";

type Tab = "reports" | "create";

export default function LaporanSampahClient() {
  const [tab, setTab] = useState<Tab>("reports");
  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-5">
        <header>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#1D9E75] border border-emerald-200">
              Portal Warga
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D5F3F]">
              Layanan Publik Cerdas
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">
            Laporan Timbulan Sampah Liar
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 leading-relaxed">
            Menemukan timbulan sampah liar di fasilitas umum atau saluran air? Tandai titik koordinat GPS, lengkapi deskripsi, dan unggah foto bukti. Laporan warga akan langsung masuk antrean sistem Pemkot & DLH Surabaya untuk ditindaklanjuti.
          </p>
        </header>

        <div role="tablist" aria-label="Navigasi Laporan Sampah" className="flex gap-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1 max-w-xs">
          {([
            { id: "reports", label: "Peta Laporan Warga" },
            { id: "create", label: "+ Buat Laporan Baru" },
          ] as const).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("flex-1 rounded-lg py-2.5 text-xs font-bold transition-all", tab === t.id ? "bg-[#0F3D2E] text-white shadow-xs" : "text-gray-500 hover:text-[#0F3D2E]")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {tab === "reports" ? <WasteReportMap onDetail={setDetailId} /> : <CreateWasteReport onDone={() => setTab("reports")} />}
        </div>
      </div>
      {detailId && <ReportDetailModal reportId={detailId} onClose={() => setDetailId(null)} />}
    </PageWrapper>
  );
}
