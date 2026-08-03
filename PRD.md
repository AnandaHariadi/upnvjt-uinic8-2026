# Product Requirements Document (PRD) — PACUL
**Platform Aksi Komunitas Untuk Lingkungan (Surabaya Pilot)**

---

## 1. Latar Belakang & Pernyataan Masalah

### 1.1 Konteks Kota Surabaya
Kota Surabaya memproduksi sekitar **1.600 hingga 1.800 ton sampah setiap harinya**, yang sebagian besar bermuara di TPA Benowo. Pemerintah Kota Surabaya telah memiliki inisiatif progresif seperti Bank Sampah dan program Surabaya Smart City. Namun, di tingkat rumah tangga, terdapat jurang pemisah yang signifikan:
1. **Ketiadaan Pengakuan Berkelanjutan**: Warga yang memilah sampah organik/anorganik atau mengumpulkan minyak jelantah dari dapur tidak memiliki catatan dampak terverifikasi, sehingga motivasi sering kali padam setelah beberapa minggu.
2. **Nilai Ekonomi Tidak Kembali ke Komunitas**: Insentif kebersihan lingkungan jarang terhubung langsung dengan warung atau UMKM di sekitar tempat tinggal warga.
3. **Keterbatasan Visibilitas Geospasial DLH**: Dinas Lingkungan Hidup (DLH) kesulitan memantau partisipasi hulu secara granular per kecamatan dan lambat mendeteksi titik tumpukan sampah liar di tempat umum sebelum menjadi krisis saluran air.

### 1.2 Visi Produk
**PACUL** hadir sebagai platform aksi komunitas digital terpadu untuk Surabaya yang:
- Memverifikasi bukti aksi hijau warga menggunakan kecerdasan buatan (*AI-assisted verification*).
- Mengonversi aksi nyata menjadi **EcoPoints** yang dapat dibelanjakan di UMKM lokal (*Bursa Pasar Hijau*).
- Mengumpulkan data aksi dan laporan sampah ke dalam **Peta Dampak Geospasial 31 Kecamatan** untuk mendukung kebijakan respon cepat pemerintah kota.

---

## 2. Target Persona Pengguna

### Persona 1: Ibu Rina (Warga Rumah Tangga di Wonokromo)
- **Karakter**: Ibu rumah tangga aktif yang sadar pentingnya kebersihan saluran air dan pemilahan sampah.
- **Tantangan**: Merasa upayanya memilah sampah dan mengumpulkan jelantah tidak ada yang menghargai.
- **Tujuan di PACUL**: Memfoto bukti pemilahan sampah, memperoleh EcoPoints, dan menukarkannya dengan sembako atau kopi di warung tetangga.

### Persona 2: Cak Teguh (Pemilik Kedai Kopi & Mitra UMKM)
- **Karakter**: Pelaku usaha mikro di sekitar Gubeng/Wonokromo.
- **Tantangan**: Ingin mempromosikan kedai ke warga sekitar tanpa biaya iklan digital yang mahal.
- **Tujuan di PACUL**: Bergabung sebagai mitra Bursa Pasar Hijau, menerima voucher diskon EcoPoints dari warga, dan mendapatkan arus pelanggan baru dari komunitas peduli lingkungan.

### Persona 3: Pak Dimas (Petugas Pengawas Lapangan DLH Surabaya)
- **Karakter**: Petugas tanggap darurat kebersihan dan drainase kota.
- **Tantangan**: Sering terlambat mengetahui tumpukan sampah liar atau saluran tersumbat sebelum ada laporan berbelit-belit atau banjir lokal.
- **Tujuan di PACUL**: Memantau dashboard tanggap sampah real-time dengan koordinat peta presisi, menugaskan tim kebersihan, dan memperbarui status penanganan secara transparan kepada publik.

---

## 3. Matriks Fitur & Spesifikasi Fungsional

### Fitur 1: AI Green Action Verifier
- **Deskripsi**: Verifikasi bukti foto untuk 5 aksi hijau percontohan:
  1. *Waste Sorting* (Pemilahan Sampah)
  2. *Used Cooking Oil* (Pengumpulan Jelantah)
  3. *Tree Planting* (Penanaman Bibit/Pohon)
  4. *Energy Saving* (Peralatan Hemat Energi)
  5. *Sustainable Transport* (Transportasi Rendah Emisi)
- **Mekanisme**:
  - Validasi sisi klien: pengecekan magic bytes (JPEG/PNG/WebP), ukuran maksimal 5 MB, resolusi minimum 320 px, dan EXIF stripping.
  - Server Analysis: Integrasi Google Cloud Vision API untuk pelabelan objek dan deteksi SafeSearch.
  - Aturan Evaluasi: Pencocokan label dengan bobot strong/weak keywords. Skor $\ge 0.75$ dinyatakan *Verified*, skor $0.5 - 0.74$ dinyatakan *Flagged* (Needs Review), di bawah $0.5$ dinyatakan *Rejected*.
  - Mode Demo: Jika kunci API tidak dipasang, sistem menyajikan hasil simulasi deterministik yang diberi label demo secara transparan.

### Fitur 2: Sistem Tokenomik & Buku Besar EcoPoints
- **Deskripsi**: Sistem poin penghargaan tertutup non-spekulatif.
- **Ketentuan Poin**:
  - Aksi Hijau Terverifikasi: +40 hingga +80 EcoPoints (tergantung jenis aksi).
  - Laporan Sampah Tervalidasi: +30 EcoPoints (maksimal 2 laporan berpahala per hari).
  - Milestone Langkah Kaki: +10 s/d +50 EcoPoints per hari.
  - Bergabung Tantangan: +20 EcoPoints; Menyelesaikan Tantangan: +100 s/d +150 EcoPoints.
- **Mitigasi Kecurangan**: Poin tidak dapat ditransfer antar akun, tidak dapat dicairkan menjadi uang tunai, dan reward tidak diskalakan berdasarkan klaim volume mandiri warga.

### Fitur 3: Bursa Pasar Hijau (UMKM Marketplace)
- **Deskripsi**: Katalog reward lokal Surabaya untuk menukarkan EcoPoints dengan barang/jasa riil.
- **Fitur Utama**:
  - Kupon digital dengan kode alfanumerik unik (`PCL-XXX-XXX`) dan kode QR.
  - Pelacakan status voucher (`active`, `used`, `expired`).
  - Pencegahan penukaran ganda untuk reward aktif yang sama.

### Fitur 4: Peta Dampak Geospasial 31 Kecamatan
- **Deskripsi**: Peta interaktif berbasis Leaflet GIS yang menampilkan akumulasi aksi per kecamatan di Surabaya.
- **Metrik yang Dapat Dipilih**:
  1. Aksi Terverifikasi (*Verified Green Actions*)
  2. Estimasi Pengurangan Emisi (*Est. $\text{CO}_2\text{e}$ Avoided*)
  3. Kontributor Aktif (*Active Contributors*)
  4. Laporan Sampah Terbuka (*Open Waste Reports*)
- **Perlindungan Privasi**: Titik koordinat rumah warga tidak pernah ditampilkan di peta publik; data diagregasikan secara eksklusif pada tingkat kecamatan.

### Fitur 5: Pelaporan Sampah Warga (Citizen Waste Report)
- **Deskripsi**: Pelaporan titik sampah publik (bukan rumah pribadi) dengan foto dan penandaan GPS.
- **Workflow**:
  - Penempatan pin di peta Surabaya atau pemilihan kecamatan.
  - Pengisian tingkat urgensi (*Low, Medium, High, Critical*).
  - Status tracking terpusat: `reported` $\rightarrow$ `in_progress` $\rightarrow$ `resolved` / `rejected`.

### Fitur 6: Carbon Tracker & OCR Struk Listrik
- **Deskripsi**: Pencatatan emisi karbon rumah tangga dengan OCR struk listrik PLN otomatis.
- **Fitur Utama**:
  - Ekstraksi otomatis No. Pelanggan, daya VA, pemakaian kWh, dan tagihan Rp.
  - Perhitungan estimasi emisi karbon berbasis faktor emisi jaringan Jawa-Madura-Bali (Jamali: 0,85 kg $\text{CO}_2$/kWh).

### Fitur 7: Portal Pengambil Kebijakan (Government Dashboard)
- **Deskripsi**: Portal operasional khusus petugas DLH Surabaya.
- **Fitur Utama**:
  - Manajemen tindak lanjut laporan sampah (penugasan armada kebersihan, pencatatan nota penyelesaian).
  - Analitik komparatif antar-wilayah Surabaya (Pusat, Utara, Timur, Selatan, Barat).
  - Ekspor data resmi dalam format CSV aman (*formula injection protected*).

---

## 4. Persyaratan Non-Fungsional (NFR)

1. **Aksesibilitas (a11y)**: Memenuhi standar WCAG AA (kontras teks $\ge 4.5:1$, landmark semantik, dukungan keyboard penuh, dan `prefers-reduced-motion`).
2. **Kinerja (Performance)**: First Load JS di bawah 170 kB, dynamic loading untuk Leaflet dan Recharts.
3. **PWA & Offline**: Mendukung instalasi tanpa toko aplikasi, caching aset inti, dan deteksi status offline.
4. **Keamanan (Security)**: Kebijakan CSP ketat, X-Frame-Options DENY, pemisahan cookie citizen/gov bertipe SameSite=Lax/Strict, dan sanitasi input form Zod.
