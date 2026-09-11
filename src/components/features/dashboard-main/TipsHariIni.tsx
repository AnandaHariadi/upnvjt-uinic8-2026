"use client";

import { Lightbulb } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";

const TIPS = [
  "Simpan minyak jelantah bekas pakai di dalam jeriken atau botol tertutup, jangan dibuang ke saluran air.",
  "Pilah sampah plastik, kertas, dan sisa makanan dari dapur untuk memudahkan pengolahan bank sampah sekitar.",
  "Gunakan transportasi umum atau berjalan kaki untuk perjalanan dekat di bawah 2 kilometer.",
  "Matikan lampu dan cabut colokan charger perangkat elektronik yang sedang tidak dipakai.",
  "Atur pendingin ruangan (AC) pada suhu ideal 24–26 °C serta bersihkan filternya secara teratur.",
  "Bawa kantong belanja dan botol minum sendiri saat berbelanja di warung sembako atau pasar tradisional.",
  "Laporkan titik timbulan sampah liar melalui fitur Laporan Sampah agar segera direspon oleh dinas terkait.",
];

export default function TipsHariIni() {
  const hydrated = useHydrated();
  const tip = TIPS[(hydrated ? new Date().getDay() : 0) % TIPS.length];
  return (
    <section aria-labelledby="tip-heading" className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5">
      <h2 id="tip-heading" className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
        <Lightbulb size={15} className="text-[#1D9E75]" aria-hidden="true" />
        Tips Lingkungan Hari Ini
      </h2>
      <p className="text-xs sm:text-sm leading-relaxed text-gray-700">{tip}</p>
    </section>
  );
}
