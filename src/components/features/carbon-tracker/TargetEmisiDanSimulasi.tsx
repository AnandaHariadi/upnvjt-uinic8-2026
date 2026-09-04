"use client";

import Link from "next/link";
import { Target, Zap, TrendingDown, ArrowRight, ShieldCheck, TreePine } from "lucide-react";

export default function TargetEmisiDanSimulasi() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
      {/* Header Target */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F3D2E]">
            <Target size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#0F3D2E]">
              Target Reduksi Emisi Rumah Tangga
            </h3>
            <p className="text-[11px] text-gray-500">Bulan Oktober 2026 · Surabaya</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
          Tren Positif
        </span>
      </div>

      {/* Progress Penurunan Emisi */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-600 font-medium">Capaian Reduksi Emisi</span>
          <span className="font-extrabold text-[#0F3D2E]">51% (18 dari 35 kg CO₂e)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#15803D] transition-all"
            style={{ width: "51%" }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">
          Kurang <strong>17 kg CO₂e</strong> lagi untuk mencapai target efisiensi bulanan keluarga Anda.
        </p>
      </div>

      {/* Simulasi Penghematan Listrik PLN & Rupiah */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={15} className="text-[#1D9E75]" />
          <h4 className="text-xs font-bold text-[#0F3D2E]">
            Simulasi Penghematan Listrik PLN
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-white border border-emerald-100 p-2">
            <span className="block text-[10px] text-gray-500">Hemat Tagihan</span>
            <span className="text-sm font-extrabold text-[#0F3D2E]">Rp 72.500</span>
            <span className="block text-[9px] text-emerald-700 mt-0.5">per 50 kWh listrik</span>
          </div>
          <div className="rounded-lg bg-white border border-emerald-100 p-2">
            <span className="block text-[10px] text-gray-500">Cegah Emisi</span>
            <span className="text-sm font-extrabold text-[#0F3D2E]">43 kg CO₂e</span>
            <span className="block text-[9px] text-emerald-700 mt-0.5">dari pembangkit</span>
          </div>
        </div>
      </div>

      {/* 3 Langkah Efisiensi Harian */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-700">3 Rekomendasi Aksi Nyata Minggu Ini:</h4>
        <div className="grid gap-2 text-xs">
          <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-[#0F3D2E]">
              1
            </span>
            <div className="flex-1">
              <span className="font-semibold text-gray-800">Gunakan Lampu LED 9 Watt</span>
              <p className="text-[11px] text-gray-500">Hemat energi hingga 80% dibanding lampu pijar konvensional.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-[#0F3D2E]">
              2
            </span>
            <div className="flex-1">
              <span className="font-semibold text-gray-800">Cabut Colokan Perangkat Standby</span>
              <p className="text-[11px] text-gray-500">Mencegah beban listrik bocor (vampire power) saat ditinggal bekerja.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-[#0F3D2E]">
              3
            </span>
            <div className="flex-1">
              <span className="font-semibold text-gray-800">Setel AC pada 25°C dengan Timer</span>
              <p className="text-[11px] text-gray-500">Setiap kenaikan 1°C mengurangi konsumsi listrik kompresor ~6%.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tautan ke EcoAction */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          <TreePine size={13} className="text-[#1D9E75]" />
          <span>Setara serapan 3 pohon kota</span>
        </span>
        <Link
          href="/dashboard/eco-action"
          className="font-bold text-[#1D9E75] hover:text-[#15803D] hover:underline flex items-center gap-1"
        >
          Klaim Aksi Hemat Listrik <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
