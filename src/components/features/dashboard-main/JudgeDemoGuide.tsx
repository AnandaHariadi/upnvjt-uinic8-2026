"use client";

import Link from "next/link";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useVoucherStore } from "@/store/voucher.store";
import { useJudgeGuideStore } from "@/store/judgeGuide.store";
import { useHydrated } from "@/hooks/useHydrated";
import { DEMO_USER_ID } from "@/lib/demo-mode";

/** Guided checklist for evaluators using the demo account. Steps tick automatically. */
export default function JudgeDemoGuide() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const actions = useGreenActionStore((s) => s.actions);
  const vouchers = useVoucherStore((s) => s.userVouchers);
  const { dismissed, visited, setDismissed } = useJudgeGuideStore();

  if (!hydrated || String(user?.id) !== DEMO_USER_ID || dismissed) return null;

  const verifiedOwn = actions.some((a) => !a.evidenceHash.startsWith("demo-seed"));
  const steps = [
    { label: "Ringkasan Dasbor", hint: "Posisi Anda saat ini.", href: "/dashboard", done: true },
    { label: "Verifikasi Aksi Hijau Berbasis AI", hint: "Pilih kategori aksi dan unggah foto bukti.", href: "/dashboard/eco-action", done: verifiedOwn },
    { label: "Pembaruan Saldo EcoPoints", hint: "Aksi terverifikasi otomatis menambah EcoPoints.", href: "/dashboard/eco-action", done: actions.some((a) => a.ecoPointsAwarded > 0) },
    { label: "Tukar Voucher UMKM & Prestasi", hint: "Tukar poin dengan voucher dan pantau lencana di Pusat Hadiah.", href: "/dashboard/marketplace", done: vouchers.length > 0 },
    { label: "Peta Dampak Wilayah Surabaya", hint: "Ganti filter metrik dan telusuri kecamatan.", href: "/dashboard/map", done: !!visited.map },
    { label: "Portal Pemkot Surabaya", hint: `Masuk dengan akun demo petugas dinas lingkungan.`, href: "/gov/login", done: !!visited.gov },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section aria-labelledby="judge-guide-heading" className="rounded-[12px] border-2 border-[#7AC74F] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 id="judge-guide-heading" className="text-sm font-bold text-[#1A1A1A]">Panduan Simulasi Evaluator · {doneCount}/{steps.length}</h2>
          <p className="text-xs text-gray-500">Ikuti seluruh siklus PACUL dari awal hingga akhir. Akun demo disiapkan dengan data simulasi awal yang konsisten.</p>
        </div>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Sembunyikan panduan demo" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.label}>
            <Link href={s.href} className="flex h-full items-start gap-2 rounded-lg border border-[#E5E7EB] p-3 hover:border-[#2D5F3F] hover:bg-[#F0FAF4]">
              {s.done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#2D5F3F]" aria-hidden="true" /> : <Circle size={18} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />}
              <span>
                <span className="block text-sm font-semibold text-[#1A1A1A]">{i + 1}. {s.label}</span>
                <span className="block text-xs text-gray-500">{s.hint}</span>
                <span className="sr-only">{s.done ? "Selesai" : "Belum selesai"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-gray-500">Akun demo portal pemkot: <span className="font-mono">gov-demo@pacul.app</span> / <span className="font-mono">GovDemo1234!</span>. Khusus untuk pengujian dan evaluasi juri.</p>
    </section>
  );
}
