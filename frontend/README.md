# Frontend Architecture & Component Specifications — PACUL

Dokumen ini memuat dokumentasi mendalam mengenai arsitektur **lapisan frontend & antarmuka pengguna** pada aplikasi PACUL.

---

## 1. Arsitektur Antarmuka & Struktur Folder

Frontend PACUL dibangun dengan **Next.js 14 App Router**, **React 18**, **Tailwind CSS**, dan **TypeScript**:

```
src/
├── app/                      # Rute App Router (Layouts & Page Client Components)
│   ├── (auth)/               # Login & Register
│   ├── dashboard/            # Portal Warga (9 modul fitur)
│   ├── gov/                  # Portal Pemkot & DLH Surabaya
│   ├── demo/                 # Panduan Juri & Walkthrough Interaktif
│   ├── layout.tsx            # Root layout (Font, Provider, Toaster)
│   └── page.tsx              # Landing Page utama
├── components/
│   ├── common/               # Komponen universal: DataBadge, ErrorBoundary, icons
│   ├── features/             # Komponen per modul bisnis:
│   │   ├── green-action/     # Verifier bukti foto, riwayat verifikasi
│   │   ├── eco-action/       # Tantangan, papan peringkat, reward table
│   │   ├── marketplace/      # Katalog voucher UMKM, QR generator
│   │   ├── waste-report/     # Wizard pelaporan sampah, peta titik respon
│   │   ├── carbon-tracker/   # Grafik emisi, OCR struk listrik, benchmark
│   │   ├── step-tracker/     # Gauge langkah, sensor pedometer
│   │   ├── collaboration-wall/# Feed postingan warga, tag populer
│   │   └── landing/          # Seksi Landing Page modern
│   ├── layout/               # Navbar, Sidebar (dengan Sign Out), Footer
│   └── maps/                 # Peta interaktif Leaflet Surabaya
├── hooks/                    # Custom React hooks (useAuth, useHydrated, useStepTracker)
├── store/                    # 11 Zustand Stores (State Management)
└── styles/                   # Global CSS & Tailwind layers
```

---

## 2. Pola State Management (Zustand & Hydration)

Untuk menghindari masalah ketidakcocokan hidrasi (SSR hydration mismatch) saat membaca data dari `localStorage`:

1. **Pola `useHydrated()` Hook**:
   ```tsx
   import { useHydrated } from "@/hooks/useHydrated";

   export default function Component() {
     const hydrated = useHydrated();
     const balance = useEcoPointsStore((s) => s.balance);

     return <span>{hydrated ? balance.toLocaleString() : "..."}</span>;
   }
   ```
2. **Karakteristik Store**:
   - Persistensi otomatis ke `localStorage` dengan penamaan `pacul-*`.
   - Fungsi reset terintegrasi (`reset("demo")` untuk skenario juri deterministik, `reset("empty")` untuk akun baru).

---

## 3. Integrasi Peta Geospasial Surabaya (Leaflet GIS)

- **Library**: `leaflet` & `react-leaflet`.
- **Aturan SSR**: Leaflet membutuhkan akses langsung ke objek `window`. Seluruh komponen kanvas peta diimpor secara dinamis menggunakan `next/dynamic({ ssr: false })`:
  ```tsx
  const ImpactMapCanvas = dynamic(
    () => import("@/components/features/local-impact-map/ImpactMapCanvas"),
    { ssr: false, loading: () => <MapLoading /> }
  );
  ```
- **Batas Kota & Titik Sentroid**: Didefinisikan secara presisi pada `src/config/surabaya.ts` mencakup batas koordinat Surabaya dan titik tengah dari seluruh 31 kecamatan.
- **Visualisasi Lingkaran Bertingkat (*Graduated Circles*)**: Ukuran radius dan opasitas lingkaran mencerminkan intensitas metrik dampak lingkungan per kecamatan.

---

## 4. Sistem Desain & Tipografi (Tailwind CSS)

- **Warna Identitas Utama**:
  - `Forest Green` (`#2D5F3F`): Warna primer representasi alam dan kebersihan.
  - `Leaf Green` (`#7AC74F`): Warna aksen cerah untuk tombol CTA dan sorotan aktif.
  - `Soft Mint` (`#F0FAF4`): Latar belakang kartu dan badge pill.
  - `Deep Jungle` (`#0A1F13` / `#162237`): Latar belakang tema gelap landing page dan portal pemkot.
- **Tipografi**:
  - Font utama: `Plus Jakarta Sans` (Google Fonts dioptimasi via `next/font/google`).
  - Font angka/kode: `JetBrains Mono` untuk kode kupon voucher dan ID laporan.

---

## 5. Fitur Progressive Web App (PWA)

- **Instalasi Mandiri**: File `public/manifest.json` menyediakan ikon dari 72px hingga 512px dan mendukung mode tampilan `standalone`.
- **Banner Instalasi Pintar (`PWAInstallBanner.tsx`)**: Mendengarkan event `beforeinstallprompt` dan memberikan panduan instalasi native di perangkat seluler.
- **Aksesibilitas (WCAG AA)**: Seluruh tombol interaktif memiliki `aria-label`, dialog modal focus-trapped dengan Radix UI, dan warna kontras teks teruji memenuhi standar AA.
