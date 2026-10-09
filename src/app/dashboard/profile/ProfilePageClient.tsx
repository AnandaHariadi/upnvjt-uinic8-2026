"use client";

import Link from "next/link";
import { ShieldCheck, Star, Target, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import PageWrapper from "@/components/common/PageWrapper";
import Achievements from "@/components/features/eco-action/Achievements";
import GreenActionHistory from "@/components/features/green-action/GreenActionHistory";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useWasteReportStore } from "@/store/wasteReport.store";
import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/hooks/useHydrated";

function Stat({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FAF4]"><Icon size={18} className="text-[#2D5F3F]" aria-hidden="true" /></span>
      <span>
        <span className="block text-xl font-extrabold text-[#1A1A1A]">{value}</span>
        <span className="block text-xs text-gray-500">{label}</span>
      </span>
    </div>
  );
}

export default function ProfilePageClient() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const actions = useGreenActionStore((s) => s.actions);
  const lifetime = useEcoPointsStore((s) => s.lifetimeEarned);
  const challengesCompleted = useEcoPointsStore((s) => s.challengesCompleted);
  const myReports = useWasteReportStore((s) => s.reports.filter((r) => user && r.reporterUserId === String(user.id)).length);

  const verified = actions.filter((a) => a.verificationStatus === "verified").length;
  const v = (n: number) => (hydrated ? n.toLocaleString("id-ID") : "...");

  return (
    <PageWrapper>
      <div className="flex flex-col gap-5">
        <ProfileHeader />

        <section aria-label="Statistik profil" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
          <Stat Icon={ShieldCheck} label="Aksi hijau terverifikasi" value={v(verified)} />
          <Stat Icon={Star} label="Total perolehan EcoPoints" value={v(lifetime)} />
          <Stat Icon={Target} label="Tantangan diselesaikan" value={v(challengesCompleted)} />
          <Stat Icon={Trash2} label="Laporan sampah terkirim" value={v(myReports)} />
        </section>

        <div className="grid gap-4 lg:grid-cols-[3fr_2fr] lg:gap-6">
          <GreenActionHistory limit={6} />
          <Achievements compact />
        </div>

        <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 text-sm text-gray-600 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-[#1A1A1A]">Penyimpanan Data & Privasi</h2>
          Pada sistem ini, data profil, riwayat aksi hijau, saldo EcoPoints, dan kupon tersimpan secara lokal pada perangkat Anda.
          Anda dapat memperbarui informasi akun kapan saja melalui menu{" "}
          <Link href="/dashboard/profile/edit" className="font-semibold text-[#2D5F3F] underline">Edit Profil</Link>.
        </section>
      </div>
    </PageWrapper>
  );
}
