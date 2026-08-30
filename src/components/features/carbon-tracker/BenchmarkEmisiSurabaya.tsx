"use client";

import Link from "next/link";
import { Scale, TrendingDown, Award, ArrowRight, Bus, Trash2, Zap } from "lucide-react";

export default function BenchmarkEmisiSurabaya() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
      {/* Header Benchmark */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F3D2E]">
            <Scale size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#0F3D2E]">
              Tolok Ukur Emisi Warga Surabaya
            </h3>
            <p className="text-[11px] text-gray-500">Kompilasi Data DLH Surabaya & ESDM</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
          Data Acuan
        </span>
      </div>

      {/* Komparasi Angka Emisi Harian */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
          <span className="block text-[10px] text-gray-500">Rata-rata Kota</span>
          <span className="text-sm font-extrabold text-gray-800">4,2 kg</span>
          <span className="block text-[9px] text-gray-400 mt-0.5">CO₂e / hari</span>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
          <span className="block text-[10px] text-emerald-800 font-semibold">Keluarga Anda</span>
          <span className="text-sm font-black text-[#0F3D2E]">2,8 kg</span>
          <span className="block text-[9px] text-emerald-700 mt-0.5">CO₂e / hari</span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
          <span className="block text-[10px] text-gray-500">Target 2050</span>
          <span className="text-sm font-extrabold text-gray-800">2,5 kg</span>
          <span className="block text-[9px] text-gray-400 mt-0.5">Net Zero</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-[#F0FAF4] border border-[#A8D5BA]/60 px-3 py-2 text-xs text-[#2D5F3F]">
        <TrendingDown size={14} className="shrink-0 text-[#1D9E75]" />
        <span>
          Estimasi emisi Anda <strong>33% lebih hemat</strong> dibanding rata-rata rumah tangga di Surabaya.
        </span>
      </div>

      {/* Peluang Konversi Gaya Hidup Rendah Karbon Jadi EcoPoints */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-700">Peluang Konversi EcoPoints:</h4>
          <span className="text-[10px] text-gray-400">Aksi Nyata Surabaya</span>
        </div>
        <div className="grid gap-2 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 shrink-0">
                <Bus size={14} />
              </span>
              <div>
                <p className="font-semibold text-gray-800 leading-tight">Suroboyo Bus & WiraWiri</p>
                <p className="text-[10px] text-gray-500">Reduksi 0,8 kg CO₂e / rute</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#0F3D2E]">
              +20 Poin
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <Trash2 size={14} />
              </span>
              <div>
                <p className="font-semibold text-gray-800 leading-tight">Setor Bank Sampah</p>
                <p className="text-[10px] text-gray-500">Reduksi 1,2 kg CO₂e / setor</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#0F3D2E]">
              +25 Poin
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 shrink-0">
                <Zap size={14} />
              </span>
              <div>
                <p className="font-semibold text-gray-800 leading-tight">Hemat Listrik 30 kWh/bln</p>
                <p className="text-[10px] text-gray-500">Reduksi 25 kg CO₂e / bulan</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#0F3D2E]">
              +50 Poin
            </span>
          </div>
        </div>
      </div>

      {/* Footer Penutup Sejajar dengan Kolom Kiri */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          <Award size={13} className="text-[#1D9E75]" />
          <span>Tukar poin jadi voucher UMKM</span>
        </span>
        <Link
          href="/dashboard/marketplace"
          className="font-bold text-[#1D9E75] hover:text-[#15803D] hover:underline flex items-center gap-1"
        >
          Pusat Hadiah & Prestasi <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
