import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Pemkot Surabaya | PACUL",
  description: "Pusat kendali dan pendukung keputusan Pemkot Surabaya: pemantauan laporan sampah, analitik aksi hijau, dan intelijen spasial 31 kecamatan.",
  robots: { index: false, follow: false },
};

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A]">
      {children}
    </div>
  );
}
