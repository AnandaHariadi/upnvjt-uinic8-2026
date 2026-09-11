"use client";

import Link from "next/link";
import { Store, Ticket, ArrowRight } from "lucide-react";
import { useVoucherStore } from "@/store/voucher.store";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function VoucherSummaryCard() {
  const hydrated = useHydrated();
  const balance = useEcoPointsStore((s) => s.balance);
  const vouchers = useVoucherStore((s) => s.userVouchers);
  const activeVouchers = vouchers.filter((v) => v.status === "active").length;

  return (
    <section className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F3D2E]">
              <Store size={18} />
            </span>
            <h2 className="text-sm font-bold text-[#0F3D2E]">Kupon Belanja UMKM</h2>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-bold text-[#0F3D2E]">
            Mitra Surabaya
          </span>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-[#4D6D5B] leading-relaxed">
          Tukarkan poin aksi hijau menjadi potongan harga belanja di warung dan pedagang sembako lokal.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-[#FAFCFB] p-3">
            <span className="text-[11px] font-medium text-gray-500 block">Poin Tersedia</span>
            <span className="text-lg font-black text-[#0F3D2E]">
              {hydrated ? balance.toLocaleString("id-ID") : "-"}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Dapat digunakan</span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-[#FAFCFB] p-3">
            <span className="text-[11px] font-medium text-gray-500 block">Kupon Aktif</span>
            <span className="text-lg font-black text-[#0F3D2E]">
              {hydrated ? activeVouchers : "-"}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Tersimpan</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-600 flex items-center gap-1.5">
          <Ticket size={14} className="text-[#1D9E75]" />
          <span>Nilai Rp 15.000 per kupon</span>
        </span>
        <Link
          href="/dashboard/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D9E75] hover:text-[#15803D] transition-colors"
        >
          <span>Katalog Warung</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
