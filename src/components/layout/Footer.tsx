import Link from "next/link";
import Image from "next/image";
import { siteConfig, teamConfig } from "@/config/site";

const SOLUTION_LINKS = [
  { label: "Verifikasi Aksi Hijau", href: "/dashboard/eco-action" },
  { label: "Bursa Diskon UMKM", href: "/dashboard/marketplace" },
  { label: "Peta 31 Kecamatan", href: "/dashboard/map" },
  { label: "Laporan Titik Sampah", href: "/dashboard/laporan-sampah" },
  { label: "Cek Struk Listrik", href: "/dashboard/tracker" },
];

const GOV_LINKS = [
  { label: "Portal Pemkot Surabaya (Demo)", href: "/gov/login" },
  { label: "Monitoring Wilayah", href: "/gov/dashboard" },
  { label: "Disposisi Petugas DLH", href: "/gov/dashboard" },
  { label: "Bank Sampah Induk Surabaya", href: "/dashboard/map" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-emerald-950/40 bg-[#07170E] text-white">
      {/* Konten Utama Footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Kolom 1: Profil Brand & Deskripsi */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Image
              src="/logo-white.png"
              alt="PACUL"
              width={124}
              height={40}
              className="h-8 w-auto object-contain object-left"
            />
            
            <p className="text-sm font-semibold text-white/95">
              {siteConfig.fullName}
            </p>

            <p className="text-xs sm:text-sm leading-relaxed text-emerald-100/75 max-w-md">
              Platform aksi komunitas untuk lingkungan Kota Surabaya. Menghubungkan kebiasaan pilah sampah dan rawat lingkungan warga dengan verifikasi cerdas serta perputaran manfaat ekonomi di warung UMKM sekitar.
            </p>
          </div>

          {/* Kolom 2: Fitur Warga */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Fitur Warga
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              {SOLUTION_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-emerald-100/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Pemerintah Kota */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Pemerintah Kota
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              {GOV_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-emerald-100/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Inisiatif */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Inisiatif
            </h3>
            <div className="text-xs text-emerald-100/80 space-y-1">
              <p className="font-semibold text-white">{teamConfig.teamName}</p>
              <p className="text-emerald-100/60">UPN &quot;Veteran&quot; Jawa Timur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Garis Bawah Hak Cipta & Kota */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 text-xs text-emerald-100/60">
          <p>© 2026 PACUL · Platform Aksi Komunitas Untuk Lingkungan.</p>
          <p>Kota Surabaya, Jawa Timur, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
