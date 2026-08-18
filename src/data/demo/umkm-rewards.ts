/**
 * DEMO DATA: Bursa Pasar Hijau catalogue.
 *
 * All merchants below are FICTIONAL, illustrative UMKM created for the
 * prototype. They are not real businesses and no partnership exists.
 * Replace with onboarded merchants (with consent) in a real pilot.
 */

export type RewardIconKey = "coffee" | "vegetables" | "soap" | "refill" | "seedlings" | "compost" | "bag" | "bicycle";

export type RewardCategory = "food" | "household" | "plants" | "crafts" | "services";

export interface DemoMerchant {
  id: string;
  name: string;
  type: string;
  kecamatanId: string;
}

export interface RewardItem {
  id: string;
  merchant: DemoMerchant;
  title: string;
  description: string;
  category: RewardCategory;
  ecoPointsCost: number;
  stock: number;
  icon: RewardIconKey;
  /** Tailwind gradient classes for the illustrative product tile. */
  tile: string;
  terms: string;
  validityDays: number;
}

export const REWARD_CATEGORIES: { id: RewardCategory | "all"; label: string }[] = [
  { id: "all", label: "Semua Kategori" },
  { id: "food", label: "Makanan & Minuman" },
  { id: "household", label: "Kebutuhan Rumah" },
  { id: "plants", label: "Tanaman & Kompos" },
  { id: "crafts", label: "Kerajinan Daur Ulang" },
  { id: "services", label: "Jasa & Servis" },
];

export const DEMO_MERCHANTS: DemoMerchant[] = [
  { id: "m_sayur", name: "Warung Sayur Bu Tini", type: "Warung Sayur", kecamatanId: "wonokromo" },
  { id: "m_kopi", name: "Kopi Kampung Genteng", type: "Kedai Kopi", kecamatanId: "genteng" },
  { id: "m_tani", name: "Tani Kota Sukolilo", type: "Kebun Komunitas", kecamatanId: "sukolilo" },
  { id: "m_craft", name: "Karya Daur Ulang Rungkut", type: "Workshop Daur Ulang", kecamatanId: "rungkut" },
  { id: "m_sabun", name: "Sabun Jelantah Tambaksari", type: "Industri Rumahan", kecamatanId: "tambaksari" },
  { id: "m_sepeda", name: "Bengkel Sepeda Tegalsari", type: "Bengkel Sepeda", kecamatanId: "tegalsari" },
  { id: "m_kompos", name: "Kompos Keluarga Gubeng", type: "Pengolah Kompos", kecamatanId: "gubeng" },
  { id: "m_refill", name: "Refill Station Mulyorejo", type: "Toko Isi Ulang", kecamatanId: "mulyorejo" },
];

const m = (id: string) => DEMO_MERCHANTS.find((x) => x.id === id)!;

export const DEMO_REWARDS: RewardItem[] = [
  {
    id: "rw_tumbler_coffee",
    merchant: m("m_kopi"),
    title: "Gratis Kopi Susu (Bawa Tumbler Sendiri)",
    description: "Satu porsi es kopi susu nikmat dengan membawa botol atau tumbler guna ulang.",
    category: "food",
    ecoPointsCost: 150,
    stock: 40,
    icon: "coffee",
    tile: "from-amber-100 to-orange-200",
    terms: "Berlaku untuk dine-in atau takeaway dengan tumbler sendiri. 1 kupon per kunjungan.",
    validityDays: 14,
  },
  {
    id: "rw_veg_bundle",
    merchant: m("m_sayur"),
    title: "Paket Sayur Segar Lokal, Diskon 15%",
    description: "Diskon belanja aneka sayuran segar hasil panen petani lokal tanpa kantong plastik sekali pakai.",
    category: "food",
    ecoPointsCost: 200,
    stock: 30,
    icon: "vegetables",
    tile: "from-lime-100 to-green-200",
    terms: "Minimal transaksi Rp 50.000. Wajib membawa tas belanja sendiri.",
    validityDays: 14,
  },
  {
    id: "rw_jelantah_soap",
    merchant: m("m_sabun"),
    title: "Sabun Batang Olahan Minyak Jelantah",
    description: "Sabun cuci alami ramah lingkungan hasil daur ulang minyak jelantah warga.",
    category: "household",
    ecoPointsCost: 180,
    stock: 25,
    icon: "soap",
    tile: "from-yellow-100 to-amber-200",
    terms: "Ambil langsung di gerai mitra. Maksimal 1 kupon per akun per minggu.",
    validityDays: 30,
  },
  {
    id: "rw_refill",
    merchant: m("m_refill"),
    title: "Isi Ulang Sabun Cuci Piring 500 ml",
    description: "Isi ulang sabun pembersih cair menggunakan wadah sendiri tanpa kemasan plastik baru.",
    category: "household",
    ecoPointsCost: 250,
    stock: 20,
    icon: "refill",
    tile: "from-sky-100 to-cyan-200",
    terms: "Bawa botol atau wadah bersih berkapasitas minimal 500 ml.",
    validityDays: 30,
  },
  {
    id: "rw_seedlings",
    merchant: m("m_tani"),
    title: "Paket 5 Bibit Cabai & Rempah Dapur",
    description: "Lima bibit siap tanam untuk pekarangan rumah atau pot hidroponik.",
    category: "plants",
    ecoPointsCost: 220,
    stock: 35,
    icon: "seedlings",
    tile: "from-emerald-100 to-green-200",
    terms: "Tergantung ketersediaan bibit musim berjalan di kebun.",
    validityDays: 21,
  },
  {
    id: "rw_compost",
    merchant: m("m_kompos"),
    title: "1 kg Kompos Organik Matang",
    description: "Pupuk kompos kaya nutrisi hasil olahan sampah organik rumah tangga.",
    category: "plants",
    ecoPointsCost: 120,
    stock: 50,
    icon: "compost",
    tile: "from-stone-100 to-amber-100",
    terms: "Ambil langsung di lokasi mitra pengolah kompos.",
    validityDays: 30,
  },
  {
    id: "rw_tote",
    merchant: m("m_craft"),
    title: "Tote Bag Upcycle dari Banner Bekas",
    description: "Tas belanja modis dan kuat yang dijahit dari spanduk bekas dan sisa kain daur ulang.",
    category: "crafts",
    ecoPointsCost: 400,
    stock: 12,
    icon: "bag",
    tile: "from-rose-100 to-pink-200",
    terms: "Maksimal 1 kali penukaran per akun.",
    validityDays: 30,
  },
  {
    id: "rw_bike_tuneup",
    merchant: m("m_sepeda"),
    title: "Servis Ringan Sepeda Gratis",
    description: "Penyetelan rem, pelumasan rantai, dan cek tekanan angin ban agar mobilitas gowes tetap aman.",
    category: "services",
    ecoPointsCost: 600,
    stock: 8,
    icon: "bicycle",
    tile: "from-blue-100 to-indigo-200",
    terms: "Tidak termasuk penggantian onderdil/spare part. Harap konfirmasi jadwal terlebih dahulu.",
    validityDays: 30,
  },
];

export const REDEMPTION_STEPS = [
  "Tukarkan voucher pilihan menggunakan saldo EcoPoints Anda.",
  "Kode voucher dan QR Code akan diterbitkan di tab “Voucher Saya”.",
  "Tunjukkan kode QR kepada kasir mitra UMKM sebelum masa berlaku habis.",
  "Mitra UMKM memverifikasi kode voucher dan memberikan produk atau diskon.",
];
