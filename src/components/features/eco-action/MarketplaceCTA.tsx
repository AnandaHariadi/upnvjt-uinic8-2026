"use client";

import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useHydrated } from "@/hooks/useHydrated";

export function MarketplaceCTA() {
  const hydrated = useHydrated();
  const balance = useEcoPointsStore((s) => s.balance);

  return (
    <section className="rounded-[12px] bg-gradient-to-r from-[#2D5F3F] to-[#1a3d27] p-5 text-white shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white/15 p-2"><Store size={22} className="text-[#7AC74F]" aria-hidden="true" /></span>
          <div>
            <h2 className="text-lg font-bold">Bursa Pasar Hijau</h2>
            <p className="mt-1 text-sm text-white/80">
              Tukarkan EcoPoints Anda dengan voucher diskon dan produk ramah lingkungan dari mitra UMKM lokal Surabaya.
            </p>
            <p className="mt-2 text-sm">
              Saldo Anda: <span className="font-bold text-[#A6E27E]">{hydrated ? balance.toLocaleString("id-ID") : "-"} EcoPoints</span>
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/marketplace"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#7AC74F] px-5 py-2.5 text-sm font-semibold text-[#10301c] hover:bg-[#8fd665]"
        >
          Lihat Katalog Voucher <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
