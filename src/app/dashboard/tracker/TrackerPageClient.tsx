"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, ShieldCheck, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/common/PageWrapper";
import TrendEmisiChart from "@/components/features/carbon-tracker/TrendEmisiChart";
import CatatAktivitasBaru from "@/components/features/carbon-tracker/CatatAktivitasBaru";
import DataListrik from "@/components/features/carbon-tracker/DataListrik";
import RiwayatAktivitas from "@/components/features/carbon-tracker/RiwayatAktivitas";
import BreakdownKategori from "@/components/features/carbon-tracker/BreakdownKategori";
import TargetEmisiDanSimulasi from "@/components/features/carbon-tracker/TargetEmisiDanSimulasi";
import BenchmarkEmisiSurabaya from "@/components/features/carbon-tracker/BenchmarkEmisiSurabaya";
import type { EmisiData } from "@/types/carbon";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { cn } from "@/utils/cn";

type TrackerTab = "aktivitas" | "listrik" | "riwayat";

const TABS: { id: TrackerTab; label: string }[] = [
  { id: "aktivitas", label: "Catat Aktivitas" },
  { id: "listrik",   label: "Struk Listrik PLN" },
  { id: "riwayat",   label: "Riwayat Catatan" },
];

export default function TrackerPageClient() {
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");
  const [activeTab, setActiveTab] = useState<TrackerTab>("aktivitas");
  const emptyData: EmisiData[] = [];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 lg:gap-6">
        <header>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#1D9E75] border border-emerald-200">
              Portal Warga
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D5F3F]">
              Pelacak Emisi Mandiri
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">
            Pelacak Jejak Karbon Pribadi Warga
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-600 leading-relaxed">
            Sebelum mengubah kebiasaan, penting untuk memantaunya terlebih dahulu. Catat perjalanan harian, konsumsi energi, atau pindai struk rekening listrik PLN Anda untuk melihat estimasi jejak emisi rumah tangga.
          </p>
        </header>

        {/* 2 Kotak Penjelas */}
        <section aria-label="Informasi Pelacak" className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
            <p className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F3D2E]">
              <BarChart3 size={16} className="text-[#1D9E75]" aria-hidden="true" />
              Pelacak Jejak Karbon
            </p>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Memperkirakan jejak emisi pribadi berdasarkan input kebiasaan harian dan pemakaian kWh listrik PLN Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
            <p className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F3D2E]">
              <ShieldCheck size={16} className="text-[#1D9E75]" aria-hidden="true" />
              Aksi Hijau Berhadiah
            </p>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed">
              Verifikasi bukti foto pilah sampah atau perawatan lingkungan dengan AI untuk memperoleh EcoPoints.{" "}
              <Link href="/dashboard/eco-action" className="font-bold text-[#1D9E75] underline">
                Verifikasi Aksi →
              </Link>
            </p>
          </div>
        </section>

        {/* Tab Bar Navigasi Fitur */}
        <div role="tablist" aria-label="Bagian Pelacak Karbon" className="flex overflow-x-auto rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1 gap-1 max-w-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F]",
                activeTab === t.id
                  ? "bg-[#0F3D2E] text-white shadow-xs"
                  : "text-gray-500 hover:text-[#0F3D2E]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Riwayat Penuh */}
        <AnimatePresence mode="wait">
          {activeTab === "riwayat" && (
            <motion.div
              key="riwayat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <RiwayatAktivitas />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Aktivitas / Listrik: 2 Kolom Sejajar & Rapi (Tanpa Gap Kosong) */}
        {activeTab !== "riwayat" && (
          <div className="grid gap-5 lg:gap-6 lg:grid-cols-[60fr_40fr]">
            {/* Kolom Kiri: Tren Grafik, Distribusi Kategori, & Target Pengurangan Emisi */}
            <div className="flex flex-col gap-5 lg:gap-6">
              <ErrorBoundary>
                <TrendEmisiChart
                  data={emptyData}
                  view={chartView}
                  onViewChange={setChartView}
                />
              </ErrorBoundary>
              <BreakdownKategori />
              <TargetEmisiDanSimulasi />
            </div>

            {/* Kolom Kanan: Form Input + Panduan & Dampak Setara Sejajar */}
            <div className="flex flex-col gap-5 lg:gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === "aktivitas" && (
                    <CatatAktivitasBaru
                      onGoToListrik={() => setActiveTab("listrik")}
                    />
                  )}
                  {activeTab === "listrik" && <DataListrik />}
                </motion.div>
              </AnimatePresence>

              {/* Panel Pelengkap Sejajar: Panduan Efisiensi & Ekuivalensi Karbon */}
              <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F3D2E]">
                      <Leaf size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-[#0F3D2E]">
                      Panduan Efisiensi Energi Warga
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Kota Surabaya
                  </span>
                </div>

                <div className="grid gap-2.5 text-xs text-gray-600">
                  <div className="flex items-start gap-2.5 rounded-xl bg-[#FAFCFB] border border-gray-100 p-3">
                    <span className="text-base leading-none">💡</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">Efisiensi AC & Pendingin Ruangan</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Atur suhu AC pada 25°C dan matikan saat ruangan kosong. Dapat menghemat sekitar 2,5 kg CO₂e per hari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl bg-[#FAFCFB] border border-gray-100 p-3">
                    <span className="text-base leading-none">🚲</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">Mobilitas Jarak Dekat</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Bersepeda atau jalan kaki untuk perjalanan di bawah 2 km mereduksi rata-rata 0,46 kg CO₂e dibanding sepeda motor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl bg-[#FAFCFB] border border-gray-100 p-3">
                    <span className="text-base leading-none">🌳</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">Dampak Setara Lingkungan</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Pengurangan emisi keluarga Anda setara dengan daya serap 3 bibit mangrove di kawasan pesisir Wonorejo Surabaya.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Punya foto aksi nyata hari ini?</span>
                  <Link href="/dashboard/eco-action" className="font-bold text-[#1D9E75] hover:text-[#15803D] hover:underline">
                    Verifikasi Foto Aksi →
                  </Link>
                </div>
              </div>

              {/* Panel Tolok Ukur Emisi Surabaya & Peluang EcoPoints (Sejajar dengan Target di Kolom Kiri) */}
              <BenchmarkEmisiSurabaya />
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
