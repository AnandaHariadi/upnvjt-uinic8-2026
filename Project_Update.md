# Project_Update.md — Laporan Status & Audit Pembaruan PACUL

**Tanggal Pembaruan**: Oktober 2026  
**Status Repositori**: Siap Evaluasi & Demonstrasi Juri (Ready for Demo & Production Roadmap)  
**Fokus Wilayah**: Pilot Kota Surabaya (31 Kecamatan)

---

## 1. Ringkasan Eksekutif

Pembaruan ini mencakup audit kode menyeluruh, perbaikan bug kritis pada sistem autentikasi, penyempurnaan akurasi OCR listrik, penguatan interaktivitas pelaporan sampah warga, pemolesan antarmuka landing page berestetika modern ala **awalmulai.id**, serta penyusunan kontrak arsitektur dan dokumentasi teknis lengkap.

---

## 2. Riwayat Perbaikan Bug & Edge Cases (Bug Fixes Log)

Berdasarkan investigasi analitis mendalam, sejumlah isu teknis telah diperbaiki:

### A. Perbaikan Bug Penghapusan Akun (`ProfileEditPage`)
- **Masalah**: Saat warga menghapus akun di `/dashboard/profile/edit`, cookie `pacul_token` tidak dihapus. Ketika diarahkan ke `/login`, middleware mendeteksi cookie aktif dan me-redirect pengguna kembali ke `/dashboard`.
- **Solusi**: Memperbarui `handleDeleteAccount` dengan menghapus `CITIZEN_COOKIE` via `Cookies.remove(CITIZEN_COOKIE)`, membersihkan localStorage `pacul_token` dan `pacul-auth`, sebelum melakukan redirect ke `/login`.

### B. Penambahan Tombol Sign Out Warga di Sidebar (`Sidebar.tsx`)
- **Masalah**: Dashboard pemkot memiliki tombol logout, namun sidebar warga tidak memiliki tombol Sign Out sama sekali, sehingga pengguna tidak dapat keluar dari sesi warga secara normal.
- **Solusi**: Menambahkan tombol Logout/Sign Out yang jelas dan responsif di bagian footer sidebar warga dengan memanfaatkan mutasi `useAuth().logoutMutation`.

### C. Perbaikan Parsing Desimal OCR Struk Listrik (`/api/ocr/scan-bill`)
- **Masalah**: Fungsi `parseNumber` menghapus semua titik dan koma (`raw.replace(/[.,]/g, "")`). Hal ini menyebabkan angka pemakaian listrik desimal seperti `248,5 kWh` atau `248.5 kWh` terkonversi menjadi `2485 kWh` (inflasi 10x lipat).
- **Solusi**: Mengimplementasikan parser desimal pintar (`allowDecimal: true`) yang membedakan format pemisah ribuan Rupiah (misal: `Rp 412.350`) dengan koma desimal kWh (misal: `248,5 kWh`).

### D. Otomatisasi Titik Koordinat Dropdown Pelaporan Sampah (`CreateWasteReport.tsx`)
- **Masalah**: Pada Step 1 formulir sampah, jika pengguna memilih kecamatan dari dropdown tanpa mengetuk peta terlebih dahulu, koordinat `lat` dan `lng` tetap `null`, menyebabkan tombol validasi *Next* tidak aktif.
- **Solusi**: Memperbarui event `onChange` pada dropdown kecamatan agar otomatis mengisi koordinat default centroid kecamatan (`k.center`) bila pengguna belum meletakkan pin manual di peta.

### E. Pencegahan Crash SSR Objek Browser
- **Masalah**: Akses `window.location.protocol` pada inisialisasi cookie berpotensi menyebabkan `ReferenceError` pada lingkungan server-side rendering.
- **Solusi**: Menambahkan guard `typeof window !== "undefined"` pada `useAuth.ts` dan `govAuth.store.ts`.

### F. Clamping Bounds pada Store Likes & Upvotes
- **Masalah**: Pengurangan likes dan upvotes pada `collaboration.store.ts` dan `wasteReport.store.ts` belum memiliki batas aman nol.
- **Solusi**: Menerapkan `Math.max(0, count - 1)` serta memberikan fallback kriptografi acak pada pembuatan kode voucher di `voucher.store.ts`.

---

## 3. Redesain Landing Page (Inspirasi awalmulai.id)

Antarmuka Landing Page pada `LandingSections.tsx` telah dirombak secara visual untuk menghadirkan pengalaman pengguna kelas atas:
- **Radial Ambient Glow**: Latar belakang bernuansa hijau hutan dalam (`#0A1F13`) dengan radial glow khas platform modern.
- **Badge Pill & Headline**: Penegasan status sebagai *"Platform Aksi Lingkungan Surabaya · Pilot 31 Kecamatan"* dengan tipografi `Plus Jakarta Sans`.
- **Stat Strip 4-Kolom**: Menampilkan angka-angka kunci secara transparan (31 Kecamatan, 5 Aksi Hijau, 100% Komunitas, 24/7 Akses Publik).
- **Bento Feature Cards**: Kartu-kartu fitur bergaya bento dengan border halus, efek hover modern, dan tautan langsung ke demo.
- **Pillar Gotong Royong Surabaya**: Integrasi nilai kearifan lokal kampung Surabaya dengan kepatuhan SDG 11 (Sustainable Cities) & SDG 12 (Responsible Consumption).

---

## 4. Status Modul Utama Aplikasi

| Modul | Status | Keterangan |
|---|---|---|
| **AI Green Action Verifier** | ✅ Stabil | Integrasi Google Cloud Vision + Fallback Simulasi Demo transparan |
| **Bursa Pasar Hijau (UMKM)** | ✅ Stabil | Katalog reward mitra Surabaya, sistem voucher kode QR instan |
| **Peta Dampak Geospasial** | ✅ Stabil | Agregasi data 31 kecamatan Surabaya dengan Leaflet GIS |
| **Citizen Waste Report** | ✅ Stabil | Pelaporan titik sampah publik, foto terkompresi, status real-time |
| **Carbon Tracker & OCR** | ✅ Stabil | OCR struk PLN dengan parsing desimal presisi & estimasi emisi |
| **Step Tracker (Langkah Hijau)** | ✅ Stabil | Pedometer sensor perangkat (HTTPS) & mode simulasi desktop |
| **Community Action Wall** | ✅ Stabil | Feed inisiatif warga dengan badge khusus aksi terverifikasi |
| **Portal Pemerintahan DLH** | ✅ Stabil | Manajemen laporan respon cepat, analisis komparatif kecamatan, ekspor CSV |

---

## 5. Rencana Tahap Lanjutan (Production Roadmap)

1. **Backend Database Persistence**: Mengintegrasikan PostgreSQL + Supabase/Prisma untuk menggantikan persistensi browser `localStorage`.
2. **Cryptographic JWT Tokens**: Menerapkan token JWT bertanda tangan dengan verifikasi kunci publik Ed25519/RS256.
3. **Integrasi Nyata UMKM & POS**: API webhook untuk validasi penukaran kupon di kasir warung/merchant mitra Surabaya.
4. **Push Notification Service Worker**: Mengaktifkan Web Push Notifications berbasis VAPID untuk pembaruan status laporan sampah.

---

## 6. Pembaruan Redesain Dasbor Pemkot (`/gov/dashboard`) & Visual Medali 3D

Berdasarkan permintaan arahan desain:
1. **Penyelarasan Layout Portal Pemkot dengan Portal Warga**:
   - Menerapkan arsitektur layout dua zona: **Sidebar Menu di Sisi Kiri** (`GovSidebar.tsx` dengan badge unit DLH, navigasi terstruktur, switch ke portal warga, dan tombol logout) serta **Area Tampilan Konten di Sisi Kanan**.
   - Mengubah palet tema dari dark navy menjadi **Clean Light Theme** (`bg-[#F5F5F5]`, kartu putih `bg-white border-[#E5E7EB]`) yang serasi dan konsisten dengan antarmuka warga (`/dashboard`).
   - Menyediakan header sambutan formal Pemkot, tanggal lokal bahasa Indonesia, banner prototip penelitian yang informatif, 4 kartu KPI utama (Aksi Hijau, Laporan Sampah, Reduksi Emisi, Kontributor Aktif), dan 4 kartu metrik operasional.
   - Mengintegrasikan sistem pagination 10 item pada daftar laporan sampah warga dan tabel statistik 31 kecamatan Surabaya.
   - Menerjemahkan 100% teks antarmuka ke dalam Bahasa Indonesia alami dan baku.
2. **Visual Medali & Lencana Prestasi Claymorphic 3D (`Badge3DIcon.tsx`)**:
   - Menghadirkan ikon medali bergaya claymorphic 3D lengkap dengan daun laurel emas, kilauan specular, gradien radial emas/zamrud/ruby, dan gembok 3D proporsional untuk lencana yang masih terkunci.
   - Menyajikan informasi progres perolehan akumulatif EcoPoints secara transparan (ambang batas 70, 300, 500, 750, 1000, 1250, 1500, 2000 poin).

---

## 7. Pemurnian Antarmuka & Kerapian Visual Portal DLH (`/gov/dashboard`)

1. **Pembersihan Elemen Antarmuka & Identitas Resmi**:
   - Menghilangkan tombol silang navigasi ke portal warga ("Buka Portal Warga") dari sidebar, top bar, dan mobile navigation untuk menjaga fokus dan privasi peran aparatur pemerintah.
   - Menghapus label "Demo environmental response unit (prototype)", "Demo Officer", dan "Role: Government", digantikan dengan profil resmi aparatur DLH Kota Surabaya (*Ir. Hendro Gunawan, M.Si - Pengawas Kebersihan Wilayah*).
   - Merapikan badge instansi di sidebar menjadi `Pemkot` (satu baris, tanpa wrap) dan teks instansi `DLH Kota Surabaya` tanpa terpotong ellipsis (`...`).
2. **Optimalisasi Tampilan Tab & Pencegahan Duplikasi Konten**:
   - Mengisolasi Banner Operasional dan 4 Kartu KPI Ringkasan Utama agar hanya muncul secara eksklusif pada tab Ikhtisar Utama (`section === "overview"`). Tab-tab spesifik (Laporan, Aksi Hijau, Peta Spasial, Komunitas, Sirkulasi Poin) kini memiliki judul dan deskripsi kontekstual mandiri.
   - Mengganti visualisasi bar chart horizontal di overview dengan **Donut Gauge Interaktif** (metrik sentral `3.405 Aksi Terverifikasi` dan breakdown persentase tiap kategori) serta sakelar ke **Kartu Dampak (Bento Grid)**.
3. **Eliminasi Full-Screen Blocking Loader**:
   - Menghapus layar loading blocking ("Memuat Pusat Kendali Lingkungan Hidup Kota Surabaya..."), sehingga transisi halaman instan dan konsisten dengan portal warga.
4. **Penyelesaian Ruang Kosong (Empty Space) Tab Sirkulasi Poin**:
   - Menambahkan `items-start` pada container grid dua kolom agar tinggi kartu tidak melar (stretch) secara artifisial.
   - Menambahkan strip 3 metrik sirkulasi (Total Diterbitkan, Terserap di UMKM, Rasio Perputaran) di bawah grafik batang peredaran EcoPoints.
   - Mengatur ulang daftar Mitra UMKM menjadi grid bento 2-kolom ringkas (`sm:grid-cols-2`), menyeimbangkan ketinggian kedua panel dan menghilangkan area kosong secara permanen.


