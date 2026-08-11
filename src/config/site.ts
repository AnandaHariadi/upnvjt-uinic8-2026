/**
 * Single source of truth for product, team and competition identity.
 * Import from here instead of hardcoding names, so the footer, landing page,
 * metadata and documentation stay consistent.
 */

export const siteConfig = {
  name: "PACUL",
  fullName: "Platform Aksi Komunitas Untuk Lingkungan",
  title: "PACUL | Platform Aksi Komunitas Untuk Lingkungan",
  tagline: "Turn verified green actions into measurable impact and local community value.",
  description:
    "PACUL is a Surabaya-first community platform where residents record green actions, verify evidence with AI assistance, earn EcoPoints redeemable at local UMKM, and build privacy-aware local impact data for smarter community decisions.",
  pilotCity: "Surabaya",
  scalingStatement:
    "Designed as a Surabaya pilot with a scalable architecture for future expansion to other cities.",
  mapTileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  repositoryUrl: "https://github.com/galiihajiip/pacul-gayatama",
} as const;

export const teamConfig = {
  teamName: "Refi está perdidamente enamorado de Cantika y la adora",
  institution: 'Universitas Pembangunan Nasional "Veteran" Jawa Timur',
  institutionShort: "UPN \"Veteran\" Jawa Timur",
  members: [
    "Galih Aji Pangestu",
    "Stevyka Frista Aninda",
    "Putri Ayu Ajeng Nina Zuraida",
  ],
} as const;

export const competitionConfig = {
  name: "GAYATAMA 5 2026",
  category: "International Web Technology Competition",
  theme: "Innovating for a Sustainable Future: Empowering Communities through Web Technology",
  primarySubthemes: ["Environment", "Smart Communities", "Economic Empowerment"],
  secondarySubthemes: ["Public Services", "Social Development"],
} as const;

/** SDGs PACUL directly contributes to, with the concrete link in the product. */
export const sdgAlignment = [
  { goal: 11, name: "Kota & Komunitas Berkelanjutan", color: "#FD9D24", link: "Pelaporan titik sampah publik dan data dampak spasial 31 kecamatan se-Surabaya." },
  { goal: 12, name: "Konsumsi & Produksi Bertanggung Jawab", color: "#BF8B2E", link: "Verifikasi pemilahan sampah dapur dan pengumpulan minyak jelantah rumah tangga." },
  { goal: 13, name: "Penanganan Perubahan Iklim", color: "#3F7E44", link: "Estimasi reduksi emisi karbon (CO₂e) dari mobilitas hijau dan konservasi energi." },
  { goal: 7, name: "Energi Bersih & Terjangkau", color: "#FCC30B", link: "Pemindaian OCR struk listrik PLN untuk memantau konsumsi energi rumah tangga." },
] as const;
