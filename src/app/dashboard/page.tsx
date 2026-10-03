import type { Metadata } from "next";
import PageWrapper from "@/components/common/PageWrapper";
import WelcomeSection from "@/components/features/dashboard-main/WelcomeSection";
import KpiCards from "@/components/features/dashboard-main/KpiCards";
import VoucherSummaryCard from "@/components/features/dashboard-main/VoucherSummaryCard";
import TantanganAktifPanel from "@/components/features/dashboard-main/TantanganAktifPanel";
import CommunityActivity from "@/components/features/dashboard-main/CommunityActivity";
import TipsHariIni from "@/components/features/dashboard-main/TipsHariIni";
import GreenActionHistory from "@/components/features/green-action/GreenActionHistory";

export const metadata: Metadata = {
  title: "Portal Warga Surabaya | PACUL",
  description: "Portal Aksi Komunitas Warga Surabaya: Saldo EcoPoints, verifikasi aksi hijau AI, tantangan aktif, dan dampak lingkungan.",
};

export default function DashboardPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-5 lg:gap-6">
        {/* Header Identitas Warga */}
        <WelcomeSection />

        {/* 4 Kartu Metrik Pribadi Warga */}
        <KpiCards />

        {/* Tata Letak Konten 2 Kolom Bersih & Rapi */}
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr] lg:gap-6">
          {/* Kolom Kiri: Riwayat Aksi Warga & Suasana Komunitas */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <GreenActionHistory limit={5} />
            <CommunityActivity />
          </div>

          {/* Kolom Kanan: Misi Tantangan, Manfaat Belanja UMKM, & Tips */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <TantanganAktifPanel />
            <VoucherSummaryCard />
            <TipsHariIni />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
