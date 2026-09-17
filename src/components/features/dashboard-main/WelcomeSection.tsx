"use client";

import Link from "next/link";
import { Camera, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useHydrated } from "@/hooks/useHydrated";

export default function WelcomeSection() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const actions = useGreenActionStore((s) => s.actions);
  const verified = hydrated ? actions.filter((a) => a.verificationStatus === "verified").length : 0;
  const today = hydrated
    ? new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  const displayName = user?.name && user.name !== "Demo" && user.name !== "Demo Resident"
    ? user.name
    : "Rendra Pratama";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
        {/* Penanda Peran & Wilayah Kecamatan Warga */}
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#0F3D2E]">
            Warga Surabaya
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={13} className="text-gray-400" />
            <span>Kecamatan {user?.district || "Wonokromo"}</span>
          </span>
        </div>

        {today && (
          <span className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-1.5 text-xs font-medium text-gray-600">
            {today}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] tracking-tight">
            Halo, {hydrated ? displayName : "Rendra Pratama"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4D6D5B] leading-relaxed">
            {verified > 0 ? (
              <>
                Tercatat{" "}
                <span className="font-bold text-[#1D9E75]">
                  {verified} aksi hijau terverifikasi
                </span>{" "}
                aktif yang telah berkontribusi mengurangi jejak emisi kota.
              </>
            ) : (
              <>
                Mulai kebiasaan baik di rumah hari ini. Unggah bukti pemilahan sampah untuk mendapatkan EcoPoints.
              </>
            )}
          </p>
        </div>

        {/* Tombol Aksi Verifikasi */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/eco-action"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#15803D] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-950/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Camera size={16} />
            <span>Verifikasi Aksi Baru</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
