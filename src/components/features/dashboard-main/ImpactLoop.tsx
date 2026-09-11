import Link from "next/link";
import { ArrowRight, Camera, Landmark, Map, ShieldCheck, Star, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const IMPACT_LOOP: { Icon: LucideIcon; title: string; text: string; href: string }[] = [
  { Icon: Camera, title: "Lakukan Aksi", text: "Pilah sampah, simpan jelantah, tanam pohon, atau naik transportasi umum.", href: "/dashboard/eco-action" },
  { Icon: ShieldCheck, title: "Verifikasi AI", text: "Unggah foto bukti. AI PACUL memeriksa keaslian dan kriteria aksi lingkungan.", href: "/dashboard/eco-action" },
  { Icon: Star, title: "Raih EcoPoints", text: "Aksi terverifikasi menghasilkan poin, lencana capaian, dan progres tantangan.", href: "/dashboard/marketplace?tab=achievements" },
  { Icon: Store, title: "Tukar di UMKM", text: "Tukarkan poin dengan voucher belanja di Pusat Hadiah & Prestasi.", href: "/dashboard/marketplace?tab=voucher" },
  { Icon: Map, title: "Pantau Kecamatan", text: "Kontribusi Anda langsung menambah capaian hijau kecamatan di Peta Dampak.", href: "/dashboard/map" },
  { Icon: Landmark, title: "Dukung Kebijakan", text: "Data aksi warga menjadi rujukan kebijakan lingkungan Pemkot Surabaya.", href: "/gov/login" },
];

/** Compact version of the PACUL loop for the dashboard. */
export default function ImpactLoop() {
  return (
    <section aria-labelledby="loop-heading" className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <h2 id="loop-heading" className="text-sm font-bold text-[#1A1A1A]">Alur Dampak Aksi Hijau Anda</h2>
      <p className="mb-3 text-xs text-gray-500">Satu bukti foto aksi nyata menggerakkan siklus perubahan berkelanjutan di Surabaya.</p>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {IMPACT_LOOP.map(({ Icon, title, text, href }, i) => (
          <li key={title}>
            <Link href={href} className="flex h-full flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3 hover:bg-[#F0FAF4]">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#2D5F3F]">
                <Icon size={14} aria-hidden="true" /> {i + 1}. {title}
                {i < IMPACT_LOOP.length - 1 && <ArrowRight size={12} className="ml-auto hidden text-gray-400 xl:block" aria-hidden="true" />}
              </span>
              <span className="text-[11px] leading-snug text-gray-600">{text}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
