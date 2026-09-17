"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import InputListrikManual from "./InputListrikManual";
import DataBadge from "@/components/common/DataBadge";
import ScanStrukListrik from "./ScanStrukListrik";

type ListrikMode = "manual" | "scan" | "analisis";

const MODES: { id: ListrikMode; label: string }[] = [
  { id: "manual",  label: "Manual entry" },
  { id: "scan",    label: "Bill OCR" },
  { id: "analisis",label: "Analysis" },
];

/* ── Analisis panel: chart 6 bulan sudah ada di InputListrikManual,
   ini hanya the lightweight standalone view ── */
function AnalisisPanel() {
  const rows = [
    { bulan: "Nov 2025", kwh: 220, status: "hemat" },
    { bulan: "Dec 2025", kwh: 195, status: "sangat_hemat" },
    { bulan: "Jan 2026", kwh: 240, status: "normal" },
    { bulan: "Feb 2026", kwh: 185, status: "hemat" },
    { bulan: "Mar 2026", kwh: 210, status: "normal" },
    { bulan: "Apr 2026", kwh: 170, status: "sangat_hemat" },
  ];

  const statusCfg: Record<string, { label: string; cls: string }> = {
    sangat_hemat: { label: "Very efficient", cls: "bg-emerald-100 text-emerald-700" },
    hemat:        { label: "Efficient", cls: "bg-green-100 text-green-700" },
    normal:       { label: "Around reference",  cls: "bg-gray-100 text-gray-600" },
    boros:        { label: "Above reference", cls: "bg-red-100 text-red-600" },
  };

  const avgKwh  = Math.round(rows.reduce((s, r) => s + r.kwh, 0) / rows.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary chips */}
      <div className="flex items-center justify-between rounded-xl bg-[#F0FAF4] px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">6-month average</p>
          <p className="mt-1 text-xl font-extrabold text-[#2D5F3F]">{avgKwh} kWh</p>
        </div>
        <DataBadge variant="demo" label="Sample history" />
      </div>

      {/* Monthly table */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {["Month", "Usage", "Status"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const cfg = statusCfg[r.status];
              return (
                <tr key={i} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">{r.bulan}</td>
                  <td className="px-4 py-3 font-bold text-[#1A1A1A]">{r.kwh} kWh</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", cfg.cls)}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-gray-400">
        Save this month through <strong>Manual entry</strong> or <strong>Bill OCR</strong> to keep your trend going.
      </p>
    </div>
  );
}

/* ── Main ── */
export default function DataListrik() {
  const [mode, setMode] = useState<ListrikMode>("manual");

  return (
    <div className="flex flex-col gap-4">
      {/* Mode switcher */}
      <div className="flex gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex-1 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all",
              mode === m.id
                ? "bg-white text-[#2D5F3F] shadow-sm"
                : "text-gray-500 hover:text-[#2D5F3F]"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "manual"  && <InputListrikManual />}
          {mode === "scan"    && <ScanStrukListrik />}
          {mode === "analisis"&& <AnalisisPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
