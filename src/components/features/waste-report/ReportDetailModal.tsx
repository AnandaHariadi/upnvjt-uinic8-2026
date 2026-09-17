"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, MapPin, ThumbsUp, X } from "lucide-react";
import {
  CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG, useWasteReportStore, type WasteReport,
} from "@/store/wasteReport.store";
import { findKecamatan } from "@/config/surabaya";
import DataBadge from "@/components/common/DataBadge";
import { cn } from "@/utils/cn";
import { WasteCategoryIcon } from "@/components/common/icons";

const fmt = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Photos({ photos, category }: { photos: string[]; category: WasteReport["category"] }) {
  const [i, setI] = useState(0);
  if (photos.length === 0) return <div className="flex h-40 items-center justify-center bg-[#F0FAF4] text-[#2D5F3F]/70"><WasteCategoryIcon category={category} size={56} /></div>;
  return (
    <div className="relative h-52 bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
      <img src={photos[i]} alt={`Foto laporan ${i + 1} dari ${photos.length}`} className="h-full w-full object-cover" />
      {photos.length > 1 && (
        <>
          <button type="button" aria-label="Foto sebelumnya" onClick={() => setI((i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Foto berikutnya" onClick={() => setI((i + 1) % photos.length)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"><ChevronRight size={16} /></button>
        </>
      )}
    </div>
  );
}

export default function ReportDetailModal({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const report = useWasteReportStore((s) => s.reports.find((r) => r.id === reportId)) as WasteReport | undefined;
  const toggleUpvote = useWasteReportStore((s) => s.toggleUpvote);
  if (!report) return null;
  const sev = SEVERITY_CONFIG[report.severity];
  const sta = STATUS_CONFIG[report.status];
  const cat = CATEGORY_CONFIG[report.category];

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        >
          <div className="relative shrink-0">
            <Photos photos={report.photos} category={report.category} />
            <Dialog.Close aria-label="Tutup" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"><X size={16} /></Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ color: sta.color, backgroundColor: sta.bg }}>{sta.label}</span>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ color: sev.color, backgroundColor: sev.bg }}>Tingkat {sev.label}</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">{cat.labelId}</span>
              {report.isDemo && <DataBadge variant="demo" />}
            </div>
            <Dialog.Title className="text-lg font-extrabold leading-snug text-[#1A1A1A]">{report.title}</Dialog.Title>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={11} aria-hidden="true" /> {report.address} · {findKecamatan(report.kecamatanId)?.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{report.description}</p>

            <button
              type="button"
              onClick={() => toggleUpvote(report.id)}
              aria-pressed={!!report.isUpvotedByMe}
              className={cn("mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold", report.isUpvotedByMe ? "bg-[#2D5F3F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}
            >
              <ThumbsUp size={15} aria-hidden="true" /> {report.isUpvotedByMe ? "Anda mendukung laporan ini" : "Saya juga melihat ini"} ({report.upvotes})
            </button>

            <h3 className="mb-3 mt-5 text-xs font-bold uppercase tracking-wider text-gray-500">Riwayat Tindak Lanjut</h3>
            <ol className="flex flex-col gap-3 border-l-2 border-[#A8D5BA] pl-4">
              {report.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-white" style={{ backgroundColor: STATUS_CONFIG[h.status].color }} aria-hidden="true" />
                  <p className="text-sm font-semibold text-[#1A1A1A]">{STATUS_CONFIG[h.status].label}{h.by && ` · ${h.by}`}</p>
                  {h.note && <p className="text-xs text-gray-600">{h.note}</p>}
                  <p className="text-[11px] text-gray-400">{fmt(h.at)}</p>
                </li>
              ))}
            </ol>

            <dl className="mt-4 grid grid-cols-2 gap-y-1 rounded-xl bg-[#F9FAFB] px-4 py-3 text-xs">
              <dt className="text-gray-500">Pelapor</dt><dd className="text-right font-semibold">{report.reporterName}</dd>
              <dt className="text-gray-500">EcoPoints diperoleh</dt><dd className="text-right font-semibold text-[#2D5F3F]">+{report.ecoPointsAwarded}</dd>
            </dl>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
