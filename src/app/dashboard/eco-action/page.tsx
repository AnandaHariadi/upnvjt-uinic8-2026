import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Trophy, Award, Target, ArrowRight } from "lucide-react";
import PageWrapper from "@/components/common/PageWrapper";
import GreenActionVerifier from "@/components/features/green-action/GreenActionVerifier";
import GreenActionHistory from "@/components/features/green-action/GreenActionHistory";

export const metadata: Metadata = {
  title: "Verifikasi Aksi Hijau | PACUL",
  description:
    "Catat aksi ramah lingkungan, verifikasi bukti foto dengan bantuan AI, dan dapatkan EcoPoints untuk ditukarkan di UMKM lokal Surabaya.",
};

export default function EcoActionPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-5 lg:gap-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2D5F3F]">Aksi Hijau</p>
          <h1 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">Verifikasi Aksi Nyata Anda untuk Surabaya</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Pilih kategori aksi, unggah bukti foto, dan peroleh verifikasi otomatis dengan bantuan AI PACUL. Setiap aksi
            terverifikasi menambah saldo EcoPoints yang dapat ditukarkan di Pusat Hadiah & Prestasi.
          </p>
        </header>

        {/* Form Verifikasi Bukti Foto Aksi Hijau */}
        <GreenActionVerifier />

        {/* Riwayat Kiriman Aksi Warga */}
        <GreenActionHistory />

        {/* Navigasi Terpadu ke Pusat Hadiah & Prestasi */}
        <section aria-label="Akses Hadiah dan Prestasi" className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-[#F0FAF4] to-emerald-50/40 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#2D5F3F]" />
                <h2 className="text-base font-bold text-[#1A1A1A]">Pusat Hadiah & Prestasi Warga</h2>
              </div>
              <p className="max-w-xl text-xs text-gray-600">
                Semua penukaran voucher UMKM lokal, papan peringkat kontribusi warga, lencana prestasi hijau, dan misi tantangan komunitas kini terintegrasi di satu tempat.
              </p>
            </div>
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#245033] transition-colors"
            >
              <span>Buka Pusat Hadiah & Prestasi</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-emerald-200/60">
            <Link
              href="/dashboard/marketplace?tab=voucher"
              className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-white hover:text-[#2D5F3F] transition-colors border border-emerald-100"
            >
              <Gift size={14} className="text-[#2D5F3F] shrink-0" />
              <span className="truncate">Tukar Kupon UMKM</span>
            </Link>
            <Link
              href="/dashboard/marketplace?tab=leaderboard"
              className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-white hover:text-[#2D5F3F] transition-colors border border-emerald-100"
            >
              <Trophy size={14} className="text-amber-600 shrink-0" />
              <span className="truncate">Papan Peringkat</span>
            </Link>
            <Link
              href="/dashboard/marketplace?tab=achievements"
              className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-white hover:text-[#2D5F3F] transition-colors border border-emerald-100"
            >
              <Award size={14} className="text-blue-600 shrink-0" />
              <span className="truncate">Lencana Capaian</span>
            </Link>
            <Link
              href="/dashboard/marketplace?tab=challenges"
              className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-white hover:text-[#2D5F3F] transition-colors border border-emerald-100"
            >
              <Target size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">Misi Tantangan</span>
            </Link>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
