import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { competitionConfig, sdgAlignment, teamConfig } from "@/config/site";

/* ── 1. Hero Section (Video Latar Belakang & Panggung Kaca Kristal) ── */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FAFDFB]">
      {/* Video Latar Belakang Jelas & Elegan */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <video
          src="/media/hero-planting.mp4"
          poster="/media/hero-planting-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-35"
        />
        {/* Lapisan Gradien Lembut Penjaga Keterbacaan Tanpa Kotak */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFDFB]/90 via-[#FAFDFB]/75 to-[#FAFDFB]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_450px_at_50%_15%,rgba(29,158,117,0.06)_0%,transparent_80%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-18 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
        {/* Tajuk Utama Terbuka & Bersih (Tanpa Kotak Pembungkus) */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-[#0F3D2E] sm:text-5xl lg:text-[54px] leading-snug sm:leading-tight lg:leading-[1.22]">
            Ubah Kebiasaan Baik di Rumah <br className="hidden sm:inline" />
            Menjadi{" "}
            <span className="relative inline-block text-[#1D9E75]">
              Manfaat Nyata.
              <svg
                className="absolute -bottom-2 left-0 w-full text-[#1D9E75]/45 pointer-events-none"
                viewBox="0 0 255 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 10C50 3 95 3 135 8.5C175 14 218 11 252 6.5"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#2D5542] sm:text-base font-medium">
            Pilah sampah dapur, kumpulkan jelantah, dan rawat lingkungan. <br className="hidden sm:inline" />
            Verifikasi foto seketika dengan AI untuk belanja hemat di warung UMKM sekitar.
          </p>

          {/* Tombol Aksi Utama - Ukuran Lebih Besar & Nyaman */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#0F3D2E] px-8 py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#0F3D2E]/20 transition-all hover:bg-[#18533F] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>Mulai Eksplorasi Demo</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/#gateway"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F3D2E]/20 bg-white/95 px-8 py-4 text-sm sm:text-base font-bold text-[#0F3D2E] shadow-sm backdrop-blur-sm transition-all hover:bg-emerald-50/60 hover:border-[#0F3D2E]/40 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>Pilih Portal Peran</span>
            </Link>
          </div>
        </div>

        {/* 3 Kartu Pilar Utama — Desain Murni & Elegan */}
        <div id="features" className="scroll-mt-24 mt-12 grid gap-5 sm:grid-cols-3">
          <div id="how-it-works" className="scroll-mt-24 contents">
            {/* Kartu 1: Verifikasi AI */}
            <div className="group rounded-3xl border border-emerald-950/[0.08] bg-white p-7 shadow-[0_12px_28px_-6px_rgba(15,61,46,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-xl font-extrabold text-[#0F3D2E]">Verifikasi Citra Cerdas</h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#4D6D5B]">
                Mendeteksi bukti pemilahan sampah dan rawat tanaman warga secara otomatis tanpa antrean birokrasi manual.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[#3B5B49] font-medium">Google Vision API</span>
                <span className="font-extrabold text-[#1D9E75]">+25 EcoPoints</span>
              </div>
            </div>

            {/* Kartu 2: Pasar Hijau */}
            <div className="group rounded-3xl border border-emerald-950/[0.08] bg-white p-7 shadow-[0_12px_28px_-6px_rgba(15,61,46,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-xl font-extrabold text-[#0F3D2E]">Ekonomi Sirkular Lokal</h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#4D6D5B]">
                Tukarkan poin aksi hijau menjadi potongan harga belanja nyata di warung tetangga dan pedagang sekitar.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[#3B5B49] font-medium">Warung UMKM Surabaya</span>
                <span className="font-extrabold text-[#0F3D2E]">Rp 15.000 / Kupon</span>
              </div>
            </div>

            {/* Kartu 3: Peta Kota */}
            <div className="group rounded-3xl border border-emerald-950/[0.08] bg-white p-7 shadow-[0_12px_28px_-6px_rgba(15,61,46,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="text-xl font-extrabold text-[#0F3D2E]">Peta Dampak Geospasial</h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#4D6D5B]">
                Visualisasi agregat partisipasi aksi hijau di 31 kecamatan Surabaya dengan perlindungan privasi alamat.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[#3B5B49] font-medium">Data Terbuka</span>
                <span className="font-extrabold text-[#0F3D2E]">31 Kecamatan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrik Kunci Dampak Kota — Tipografi Tegas & Bersih Tanpa Ikon Menumpuk */}
        <div className="mt-10 rounded-[2rem] border border-emerald-950/[0.08] bg-white/80 p-3 sm:p-4 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(15,61,46,0.08)]">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {/* Metrik 1: 31 Kecamatan */}
            <div className="rounded-2xl border border-emerald-950/[0.05] bg-gradient-to-br from-white to-emerald-50/40 p-4 transition-all hover:bg-white hover:shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F3D2E]">31</span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase">Wilayah</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#2D5542]">Kecamatan di Surabaya</p>
            </div>

            {/* Metrik 2: 5 Kategori AI */}
            <div className="rounded-2xl border border-emerald-950/[0.05] bg-gradient-to-br from-white to-emerald-50/40 p-4 transition-all hover:bg-white hover:shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F3D2E]">5</span>
                <span className="text-[11px] font-mono font-bold text-teal-700 uppercase">Kategori</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#2D5542]">Validasi Citra Otomatis</p>
            </div>

            {/* Metrik 3: 100% Non-Kripto */}
            <div className="rounded-2xl border border-emerald-950/[0.05] bg-gradient-to-br from-white to-emerald-50/40 p-4 transition-all hover:bg-white hover:shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F3D2E]">100%</span>
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase">Non-Kripto</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#2D5542]">Manfaat Belanja Riil</p>
            </div>

            {/* Metrik 4: Real-Time Akses */}
            <div className="rounded-2xl border border-emerald-950/[0.05] bg-gradient-to-br from-white to-emerald-50/40 p-4 transition-all hover:bg-white hover:shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F3D2E]">Real-Time</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#2D5542]">Agregasi Spasial DLH</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. Tantangan Nyata Lingkungan Kota Surabaya ── */
export function Problem() {
  const tantangan = [
    {
      nomor: "01",
      kategori: "Hulu Rumah Tangga",
      judul: "Sampah Dapur Tercampur Sejak dari Rumah",
      info: "Sisa makanan dan kemasan plastik dibuang langsung ke satu tempat sampah yang sama. Tanpa pemilahan mandiri di dapur keluarga, seluruh timbulan masuk menjadi beban residu kota.",
      akibat: "1.800 ton sampah masuk setiap hari ke TPA Benowo tanpa terpilah, mempercepat habisnya daya tampung kota.",
    },
    {
      nomor: "02",
      kategori: "Saluran Drainase Kota",
      judul: "Minyak Jelantah Dibuang ke Selokan",
      info: "Minyak sisa penggorengan dibuang ke wastafel dan got perumahan. Minyak membeku dan memadat menjadi kerak yang menyumbat saluran air permukiman.",
      akibat: "Saluran drainase menyempit dan memicu genangan air saat curah hujan tinggi di berbagai wilayah Surabaya.",
    },
    {
      nomor: "03",
      kategori: "Retensi Partisipasi Warga",
      judul: "Semangat Warga Cepat Padam",
      info: "Sosialisasi atau perlombaan lingkungan kerap ramai hanya sesaat. Tanpa apresiasi dan manfaat ekonomi yang dirasakan langsung di kehidupan sehari-hari, kebiasaan baik warga sulit bertahan lama.",
      akibat: "Partisipasi warga terhenti begitu masa kampanye usai, aksi tidak terbangun menjadi kebiasaan rutin mandiri.",
    },
    {
      nomor: "04",
      kategori: "Monitoring Armada DLH",
      judul: "Titik Tumpukan Sampah Tersebar Liar",
      info: "Dinas kebersihan sulit mendeteksi titik tumpukan sampah liar di sudut-sudut permukiman tanpa adanya laporan berkoordinat lokasi yang akurat langsung dari warga sekitar.",
      akibat: "Alokasi rute armada truk pengangkut sampah menjadi lambat dan penanganan timbulan liar terhambat.",
    },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">
        {/* Tajuk Bagian Tengah */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-[#0F3D2E] sm:text-4xl leading-tight">
            Tantangan Nyata di Kota Surabaya
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#3B5B49]">
            Masalah lingkungan perkotaan yang bermula dari rumah tangga dan berdampak langsung ke kebersihan kota.
          </p>
        </div>

        {/* Banner Metrik Utama Kota */}
        <div className="mt-10 rounded-2xl border border-gray-200/80 bg-[#FAFCFB] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                Timbulan Sampah Kota Surabaya
              </span>
              <p className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#0F3D2E]">
                1.800 Ton <span className="text-base sm:text-lg font-semibold text-[#4D6D5B]">/ hari</span>
              </p>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-[#4D6D5B] leading-relaxed border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
              Sebagian besar sampah masuk ke TPA Benowo dalam kondisi tercampur tanpa pemilahan awal di tingkat rumah tangga.
            </p>
          </div>
        </div>

        {/* 4 Kartu Masalah - Jelas, Berbobot, & Terstruktur Rapi */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {tantangan.map(({ nomor, kategori, judul, info, akibat }) => (
            <div
              key={nomor}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,61,46,0.04)] transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center rounded-lg bg-emerald-50 px-2.5 py-1 font-mono text-xs font-black tracking-wider text-emerald-700 border border-emerald-100">
                    {nomor}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70">
                    {kategori}
                  </span>
                </div>

                <h3 className="mt-3.5 text-base sm:text-lg font-bold text-[#0F3D2E] leading-snug">
                  {judul}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#4D6D5B]">
                  {info}
                </p>
              </div>

              {/* Kotak Dampak Lapangan yang Terstruktur Tegas */}
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Dampak Lapangan
                </div>
                <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-red-950 font-medium">
                  {akibat}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. Flagship Interactive Showcase — 3 Panggung Solusi Nyata Berbasis UI Mockup ── */
export function FlagshipShowcase() {
  return (
    <section id="features" className="scroll-mt-16 bg-[#F8FAF9] px-4 py-20 sm:px-6 sm:py-28 border-t border-gray-100">
      <div id="how-it-works" className="scroll-mt-24 mx-auto max-w-6xl">
        {/* Header Bagian Terstruktur & Elegan */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-[#0F3D2E] sm:text-4xl lg:text-[44px] leading-snug sm:leading-tight">
            Solusi Nyata di Tangan Warga, <br className="hidden sm:inline" />
            <span className="text-[#1D9E75]">Dampak Terukur</span> di Seluruh Kota.
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#3B5B49] max-w-2xl mx-auto">
            Bukan sekadar konsep di atas kertas. Tiga instrumen digital terintegrasi yang mengubah kebiasaan memilah sampah rumah tangga menjadi perputaran daya beli warung dan transparansi geospasial kota.
          </p>
        </div>

        {/* 3 Showcase Bento Cards dengan Visual Mockup Nyata */}
        <div className="mt-14 space-y-8 lg:space-y-10">
          {/* Showcase 1: Vision AI Engine */}
          <div className="grid items-center gap-8 rounded-[2.5rem] border border-emerald-950/[0.08] bg-white p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 shadow-[0_16px_40px_-10px_rgba(15,61,46,0.08)]">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F3D2E] tracking-tight">
                Verifikasi Bukti Aksi Otomatis & Objektif
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4D6D5B]">
                Warga cukup memotret aksi pemilahan sampah atau setor minyak jelantah. Model machine learning Google Cloud Vision menganalisis keaslian foto, mencocokkan label wadah, mencegah duplikasi hash SHA-256, dan seketika menerbitkan EcoPoints tanpa antrean birokrasi.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#0F3D2E]">
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Anti-Duplikasi SHA-256</span>
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Multi-Label Detection</span>
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Batas Usia Bukti 72 Jam</span>
              </div>
              <div className="mt-7">
                <Link
                  href="/dashboard/eco-action"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#0F3D2E]/20 transition-all hover:bg-[#18533F] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Coba Verifikasi Foto di Demo</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Visual Mockup 1: Simulated Camera Scanner UI */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-950/20 bg-gradient-to-br from-[#0A2015] via-[#0E2E1E] to-[#06140D] p-5 text-white shadow-2xl">
                {/* Viewfinder Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs tracking-wider">
                    VISION SCANNER
                  </div>
                  <span className="font-mono text-[11px] text-white/60">ID: ACC-2026-SBY</span>
                </div>

                {/* Simulated Photo Frame with Bounding Box */}
                <div className="relative mt-4 h-48 sm:h-56 w-full overflow-hidden rounded-2xl bg-[#0F3320] border border-white/15">
                  <Image
                    src="/media/hero-planting-poster.jpg"
                    alt="Simulasi Foto Aksi Hijau"
                    fill
                    className="object-cover opacity-60"
                  />
                  {/* Neon Bounding Box */}
                  <div className="absolute inset-x-8 inset-y-6 rounded-xl border-2 border-[#7AC74F] bg-[#7AC74F]/10 shadow-[0_0_15px_rgba(122,199,79,0.3)] flex flex-col justify-between p-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[#0F3D2E] px-2 py-0.5 font-mono text-[10px] font-bold text-[#7AC74F]">
                        [✓] Botol PET Bersih Terdeteksi
                      </span>
                      <span className="rounded-md bg-[#7AC74F] px-1.5 py-0.5 text-[10px] font-black text-[#082011]">
                        99.4%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/80">
                      <span>Integritas: Lolos Anti-Spoof</span>
                      <span className="font-mono text-emerald-300">GPS: Surabaya</span>
                    </div>
                  </div>
                </div>

                {/* Result Pill */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/15">
                  <div>
                    <p className="text-xs font-bold text-white">Status: Terverifikasi Otomatis</p>
                    <p className="text-[11px] text-emerald-200/70">Reduksi: 0.42 kg CO₂e</p>
                  </div>
                  <span className="rounded-full bg-[#7AC74F] px-3.5 py-1 text-xs font-black text-[#082011] shadow-md shadow-[#7AC74F]/30">
                    +25 EcoPoints
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase 2: Pasar Hijau Digital Voucher */}
          <div className="grid items-center gap-8 rounded-[2.5rem] border border-emerald-950/[0.08] bg-white p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 shadow-[0_16px_40px_-10px_rgba(15,61,46,0.08)]">
            {/* Visual Mockup 2: Perforated Digital Voucher */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="relative mx-auto max-w-md">
                {/* Perforated Coupon Card */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-6 sm:p-7 shadow-xl">
                  {/* Decorative Notch Circles */}
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#F8FAF9] border-r-2 border-dashed border-emerald-300" />
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#F8FAF9] border-l-2 border-dashed border-emerald-300" />

                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F3D2E] text-white font-bold text-xs">
                        P
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#0F3D2E]">Kupon Belanja UMKM</p>
                        <p className="text-[10px] text-gray-500">Mitra Resmi Surabaya</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      100% Non-Kripto
                    </span>
                  </div>

                  <div className="my-5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Nilai Potongan Belanja</span>
                    <p className="text-3xl sm:text-4xl font-black text-[#0F3D2E] mt-1">
                      Rp 15.000
                    </p>
                    <p className="text-xs font-semibold text-[#1D9E75] mt-1">
                      Warung Kopi & Sembako Bu Siti · Wonokromo
                    </p>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="border-t border-gray-200 pt-4 flex flex-col items-center">
                    <div className="h-9 w-48 bg-[repeating-linear-gradient(90deg,#0F3D2E,#0F3D2E_2px,transparent_2px,transparent_4px,#0F3D2E_4px,#0F3D2E_7px,transparent_7px,transparent_9px)] rounded-xs opacity-75" />
                    <span className="mt-1 font-mono text-[10px] font-bold tracking-widest text-gray-500">
                      SBY-2026-PACUL-7789
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F3D2E] tracking-tight">
                Poin Lingkungan yang Menghidupkan Ekonomi Warung
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4D6D5B]">
                EcoPoints dirancang sebagai instrumen ekonomi sirkular riil, bukan instrumen spekulasi. Poin aksi hijau ditukarkan langsung menjadi potongan harga belanja di warung kopi, sembako, dan bengkel sekitar tempat tinggal warga.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#0F3D2E]">
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Kupon Digital Perforasi</span>
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Mitra Warung Tetangga</span>
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Proteksi Pembatalan Aman</span>
              </div>
              <div className="mt-7">
                <Link
                  href="/dashboard/marketplace"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#0F3D2E]/20 transition-all hover:bg-[#18533F] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Buka Bursa Voucher UMKM</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Showcase 3: Geospasial Surabaya & Laporan GPS */}
          <div className="grid items-center gap-8 rounded-[2.5rem] border border-emerald-950/[0.08] bg-white p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 shadow-[0_16px_40px_-10px_rgba(15,61,46,0.08)]">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F3D2E] tracking-tight">
                Peta Dampak Terbuka & Respon Armada Presisi
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4D6D5B]">
                Warga dapat melaporkan timbulan sampah liar publik lengkap dengan koordinat GPS real-time, sementara peta agregasi spasial 31 kecamatan menyajikan data transparan tanpa membuka privasi rumah tangga, memandu armada kebersihan kota bekerja lebih efisien.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#0F3D2E]">
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">GPS Koordinat Real-Time</span>
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">31 Kecamatan Terpetakan</span>
                <span className="rounded-xl bg-gray-100 px-3 py-1.5">Privasi Alamat Terlindungi</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/map"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#0F3D2E]/20 transition-all hover:bg-[#18533F] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Buka Peta Dampak</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/dashboard/laporan-sampah"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-900/20 bg-emerald-50/60 px-5 py-3 text-sm font-bold text-[#0F3D2E] hover:bg-emerald-100/60 transition-all"
                >
                  <span>Simulasi Lapor Sampah</span>
                </Link>
              </div>
            </div>

            {/* Visual Mockup 3: Geospasial Radar Display */}
            {/* Visual Mockup 3: Real Civic Data Dashboard for Surabaya DLH */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-950/20 bg-gradient-to-br from-[#0A2214] via-[#0E301D] to-[#06170D] p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      DLH SURABAYA · SISTEM AGREGASI WILAYAH
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Sebaran Partisipasi 31 Kecamatan</h4>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#7AC74F] bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                    ● Aktif
                  </span>
                </div>

                {/* Civic District Stats List */}
                <div className="my-4 space-y-2.5">
                  {[
                    { nama: "Wonokromo", aksi: 342, status: "Terkelola Optimal", pct: 86, tag: "Bank Sampah Aktif" },
                    { nama: "Rungkut", aksi: 289, status: "Partisipasi Tinggi", pct: 74, tag: "Setor Jelantah" },
                    { nama: "Gubeng", aksi: 215, status: "Terkelola Optimal", pct: 60, tag: "Kompos Mandiri" },
                    { nama: "Tegalsari", aksi: 178, status: "Armada Siaga", pct: 50, tag: "Laporan Tuntas" },
                  ].map((row) => (
                    <div key={row.nama} className="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Kec. {row.nama}</span>
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                            {row.tag}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#7AC74F]">{row.aksi} Aksi</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#7AC74F]" style={{ width: `${row.pct}%` }} />
                        </div>
                        <span className="text-[10px] text-white/60 font-mono">{row.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-medium">Privasi: Agregasi Tingkat RW / Wilayah</span>
                  <span className="font-mono font-bold text-[#7AC74F]">Armada DLH: 14 Unit Siaga</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Kompatibilitas alias untuk mempertahankan kelancaran import lama
export const HowItWorks = FlagshipShowcase;
export const Features = FlagshipShowcase;

/* ── 5. Kearifan Lokal Gotong Royong Surabaya ── */
export function BuiltForSurabaya() {
  const pilar = [
    {
      judul: "Warga Berdaya",
      info: "Dokumentasikan aksi peduli lingkungan langsung dari ponsel tanpa birokrasi rumit.",
    },
    {
      judul: "Respon Sampah Presisi",
      info: "Laporan titik sampah membawa koordinat GPS akurat langsung untuk armada dinas kebersihan.",
    },
    {
      judul: "Ekonomi Kampung Berputar",
      info: "EcoPoints dibelanjakan di pedagang tetangga, menjaga daya beli tetap berputar di tingkat lokal.",
    },
    {
      judul: "Data Terbuka 31 Kecamatan",
      info: "Agregasi spasial terbuka membantu dinas merencanakan rute kebersihan kota secara presisi.",
    },
  ];

  return (
    <section id="surabaya" className="scroll-mt-16 bg-gradient-to-br from-[#0B2516] via-[#0F3320] to-[#081B10] px-4 py-18 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-black text-white sm:text-4xl leading-snug sm:leading-[1.35]">
            Melengkapi Semangat Bank Sampah <br className="hidden sm:inline" />
            & Tradisi Gotong Royong
          </h2>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-emerald-100/80">
            Warga Surabaya sudah lama mandiri menjaga lingkungannya. PACUL hadir memperkuat tradisi ini agar setiap kebaikan terdata transparan dan berbuah manfaat timbal balik.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pilar.map(({ judul, info }) => (
            <div
              key={judul}
              className="group rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-7 backdrop-blur-md shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.22)] transition-all duration-300 hover:border-white/35 hover:bg-white/[0.16] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:-translate-y-1.5"
            >
              <h3 className="text-lg font-bold tracking-tight text-white">{judul}</h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-emerald-100/80">{info}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 6. SDGs Alignment (100% Bahasa Indonesia) ── */
export function Alignment() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-block rounded-full border border-emerald-900/10 bg-emerald-50 px-5 py-2 text-xs sm:text-sm font-bold text-[#0F3D2E] shadow-2xs">
            Komitmen Keberlanjutan ESG
          </span>
          <h2 className="mt-5 text-xl font-black text-[#0F3D2E] sm:text-3xl leading-snug sm:leading-[1.35]">
            Keselarasan Komitmen <br className="hidden sm:inline" />
            Pembangunan Berkelanjutan (SDGs)
          </h2>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#4D6D5B]">
            Kontribusi nyata PACUL terhadap target keberlanjutan perkotaan dan iklim global.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sdgAlignment.map((s) => (
            <div
              key={s.goal}
              className="flex flex-col justify-between rounded-3xl border border-emerald-950/[0.06] bg-[#FAFCFB] p-6 shadow-xs transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                <span
                  className="inline-block rounded-xl px-2.5 py-1 text-xs font-black text-white shadow-xs"
                  style={{ backgroundColor: s.color }}
                >
                  SDG {s.goal}
                </span>
                <h3 className="mt-4 text-sm font-bold text-[#0F3D2E]">{s.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#4D6D5B]">{s.link}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 7. Privasi & Keamanan Data (Privacy by Design) ── */
export function Privacy() {
  const proteksi = [
    { judul: "Data Minimal", info: "Hanya butuh nama dan email tanpa meminta identitas KTP atau dokumen sensitif." },
    { judul: "Lokasi Tersamarkan", info: "Koordinat GPS warga dibatasi sebatas batas wilayah kecamatan." },
    { judul: "Peta Agregat", info: "Menyajikan total statistik kecamatan tanpa membuka titik alamat rumah." },
    { judul: "EXIF Scrubbing", info: "Metadata foto otomatis dibersihkan langsung di browser ponsel sebelum diunggah." },
    { judul: "Kunci AI Aman", info: "Kunci server Google Cloud Vision tersimpan aman di environment server-side." },
    { judul: "Sesi Mandiri", info: "Sesi warga dan portal petugas dinas terpisah secara fisik dengan token independen." },
  ];

  return (
    <section id="privacy" className="scroll-mt-16 bg-[#FAFDFB] px-4 py-16 sm:px-6 sm:py-20 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-block rounded-full border border-emerald-900/10 bg-emerald-50 px-5 py-2 text-xs sm:text-sm font-bold text-[#0F3D2E] shadow-2xs">
            Privacy by Design
          </span>
          <h2 className="mt-5 text-xl font-black text-[#0F3D2E] sm:text-3xl leading-snug sm:leading-[1.35]">
            Menghormati Privasi Seluruh Warga
          </h2>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#4D6D5B]">
            Arsitektur keamanan data yang menjamin partisipasi warga tetap aman, anonim, dan terlindungi.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proteksi.map((p, idx) => (
            <div
              key={p.judul}
              className="flex items-start gap-4 rounded-3xl border border-emerald-950/[0.06] bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-[#0F3D2E] text-[11px] font-mono font-bold">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F3D2E]">{p.judul}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4D6D5B]">{p.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Profil Tim Inovasi Mahasiswa ── */
export function Team() {
  return (
    <section id="team" className="scroll-mt-16 bg-white px-4 py-16 sm:px-6 sm:py-20 border-t border-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-block rounded-full border border-emerald-900/10 bg-emerald-50 px-5 py-2 text-xs sm:text-sm font-bold text-[#0F3D2E] shadow-2xs">
            Tim Inovasi Mahasiswa
          </span>
          <h2 className="mt-4 text-xl font-black tracking-tight text-[#0F3D2E] sm:text-3xl">
            {teamConfig.teamName}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            {teamConfig.institution} · {competitionConfig.name}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {teamConfig.members.map((m) => (
            <div key={m} className="flex items-center gap-3.5 rounded-3xl border border-gray-200/80 bg-[#FAFCFB] p-5 shadow-2xs">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F3D2E] text-xs font-bold text-white shadow-xs">
                {m.split(" ").slice(0, 2).map((w) => w[0]).join("")}
              </span>
              <div>
                <p className="text-xs font-bold text-[#0F3D2E]">{m}</p>
                <p className="text-[10px] text-gray-400">{teamConfig.institutionShort}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 9. Call to Action Eksekutif — Dua Gerbang Eksplorasi Interaktif ── */
export function FinalCta() {
  return (
    <section id="gateway" className="scroll-mt-16 relative bg-[#FAFDFB] px-4 py-16 sm:px-6 sm:py-24 border-t border-gray-100">
      <div id="team" className="scroll-mt-20 mx-auto max-w-6xl">
        {/* Kontainer Utama Bergaya Glass Command Center */}
        <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-b from-[#092617] via-[#0E3522] to-[#06180E] p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-emerald-950/20">
          {/* Garis Aksen Pendar Cahaya di Sisi Atas */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#7AC74F] to-transparent" />

          {/* Latar Belakang Pendar Cahaya Radial & Vektor Geometris */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-[#7AC74F]/10 blur-3xl" />

          {/* Tajuk Utama Banner */}
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl leading-tight">
              Mulai Jelajahi Ekosistem PACUL
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-emerald-100/80 font-medium">
              Uji coba sistem interaktif warga atau akses portal pemerintah kota langsung di peramban tanpa instalasi aplikasi.
            </p>
          </div>

          {/* Dua Kartu Pilihan Gerbang Masuk (Bento Dual-Gateway) */}
          <div className="relative z-10 mt-10 grid gap-6 md:grid-cols-2">
            {/* Gerbang 1: Warga & UMKM */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.10] to-white/[0.04] p-7 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/50 hover:bg-white/[0.14] hover:-translate-y-1 hover:shadow-xl">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Simulasi Aksi Warga & UMKM
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-100/75">
                  Verifikasi bukti pilah sampah dan rawat tanaman dengan AI, kumpulkan EcoPoints, lalu tukarkan kupon diskon di warung pedagang sekitar.
                </p>

                <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/80">
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#7AC74F] shrink-0" />
                    <span>Verifikasi foto otomatis dengan Vision AI Engine</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#7AC74F] shrink-0" />
                    <span>Katalog voucher diskon belanja UMKM Surabaya</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#7AC74F] shrink-0" />
                    <span>Pelaporan titik timbulan sampah berkoordinat GPS</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/login?role=warga"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D9E75] to-[#15803D] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.98]"
                >
                  <span>Mulai Demo Interaktif Warga</span>
                  <ArrowRight size={16} className="text-white" />
                </Link>
              </div>
            </div>

            {/* Gerbang 2: Pemerintah Kota & Dinas */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.10] to-white/[0.04] p-7 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/50 hover:bg-white/[0.14] hover:-translate-y-1 hover:shadow-xl">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Portal Pemkot Surabaya & DLH
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-100/75">
                  Akses dashboard analitik terpadu untuk memantau data agregat aksi lingkungan di 31 kecamatan Surabaya serta mengoordinasikan respon armada.
                </p>

                <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/80">
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#7AC74F] shrink-0" />
                    <span>Peta agregasi spasial terbuka 31 kecamatan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#7AC74F] shrink-0" />
                    <span>Tiket laporan timbulan sampah publik real-time</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#7AC74F] shrink-0" />
                    <span>Perencanaan rute kebersihan kota berbasis data</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/login?role=gov"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D9E75] to-[#15803D] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.98]"
                >
                  <span>Buka Portal Pemkot (Demo)</span>
                  <ArrowRight size={16} className="text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
