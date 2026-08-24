"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, LogOut, LayoutDashboard, ClipboardList, Leaf, Map, Users, Store, ExternalLink, ShieldCheck
} from "lucide-react";
import { cn } from "@/utils/cn";
import { teamConfig } from "@/config/site";

export type GovSection = "overview" | "reports" | "actions" | "spatial" | "community" | "economy";

interface GovSidebarProps {
  activeSection: GovSection;
  onSelectSection: (s: GovSection) => void;
  openReportsCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
  officerName: string;
  officerUnit: string;
  officerRole: string;
}

const GOV_NAV = [
  { id: "overview" as GovSection, label: "Ringkasan Dasbor", icon: LayoutDashboard },
  { id: "reports" as GovSection, label: "Laporan Sampah Warga", icon: ClipboardList, hasBadge: true },
  { id: "actions" as GovSection, label: "Analisis Aksi Hijau", icon: Leaf },
  { id: "spatial" as GovSection, label: "Peta Intelijen Spasial", icon: Map },
  { id: "community" as GovSection, label: "Partisipasi Komunitas", icon: Users },
  { id: "economy" as GovSection, label: "Ekonomi & EcoPoints", icon: Store },
] as const;

function GovSidebarContent({
  activeSection,
  onSelectSection,
  openReportsCount,
  onLogout,
  officerName,
  officerUnit,
  officerRole,
  onItemClick,
}: {
  activeSection: GovSection;
  onSelectSection: (s: GovSection) => void;
  openReportsCount: number;
  onLogout: () => void;
  officerName: string;
  officerUnit: string;
  officerRole: string;
  onItemClick?: () => void;
}) {
  const cleanUnit =
    !officerUnit || officerUnit.includes("Demo") || officerUnit.includes("prototype")
      ? "Dinas Lingkungan Hidup Kota Surabaya"
      : officerUnit;
  const cleanName =
    !officerName || officerName.includes("Demo")
      ? "Ir. Hendro Gunawan, M.Si"
      : officerName;
  const cleanRole =
    officerRole === "government" || officerRole === "admin"
      ? "Pengawas Kebersihan Wilayah"
      : officerRole;

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Header Logo & Penanda Peran Pemkot */}
        <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-4">
          <Link href="/gov/dashboard" aria-label="Beranda Portal Pemkot" className="transition-opacity hover:opacity-90">
            <Image src="/logo.png" alt="PACUL" width={110} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
            Pemkot
          </span>
        </div>

        {/* Kotak Identitas Satuan Petugas */}
        <div className="mx-3 mt-3 rounded-xl border border-emerald-100 bg-[#F0FAF4] p-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#0F3D2E] font-bold">
            <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
            <span className="text-[11px] font-bold text-[#0F3D2E]">DLH Kota Surabaya</span>
          </div>
          <p className="mt-1 font-bold text-gray-900 truncate text-xs">{cleanName}</p>
          <p className="text-[10px] text-gray-500 font-medium">Jabatan: {cleanRole}</p>
        </div>

        {/* Menu Navigasi Samping Kiri */}
        <nav className="p-3" aria-label="Navigasi Portal Pemkot">
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Menu Operasional
          </p>
          <ul className="flex flex-col gap-1">
            {GOV_NAV.map(({ id, label, icon: Icon, ...rest }) => {
              const isActive = activeSection === id;
              const hasBadge = "hasBadge" in rest ? rest.hasBadge : false;

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection(id);
                      if (onItemClick) onItemClick();
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F]",
                      isActive
                        ? "bg-[#A8D5BA] text-[#2D5F3F] font-bold shadow-2xs"
                        : "text-gray-600 hover:bg-[#F5F5F5] hover:text-[#2D5F3F]"
                    )}
                  >
                    <Icon size={17} aria-hidden="true" className={cn("shrink-0", isActive ? "text-[#2D5F3F]" : "text-gray-400")} />
                    <span className="flex-1 text-left truncate">{label}</span>
                    {hasBadge && openReportsCount > 0 && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white leading-none">
                        {openReportsCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Navigasi Bawah */}
      <div className="border-t border-[#E5E7EB] p-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors shadow-2xs"
        >
          <LogOut size={14} />
          <span>Keluar Akun Dinas</span>
        </button>

        <div className="pt-1 text-center">
          <p className="text-[11px] text-gray-500 font-medium">© 2026 PACUL · Pemkot Surabaya</p>
          <p className="text-[10px] text-gray-400">Pusat Kendali Respon Lingkungan</p>
        </div>
      </div>
    </div>
  );
}

export default function GovSidebar({
  activeSection,
  onSelectSection,
  openReportsCount,
  mobileOpen,
  onMobileClose,
  onLogout,
  officerName,
  officerUnit,
  officerRole,
}: GovSidebarProps) {
  // Desktop Sidebar (Sticky, Always visible on lg+)
  return (
    <>
      <aside
        className="sticky top-0 h-screen hidden w-64 shrink-0 border-r border-[#E5E7EB] bg-white lg:block overflow-y-auto"
        aria-label="Navigasi Pemkot"
      >
        <GovSidebarContent
          activeSection={activeSection}
          onSelectSection={onSelectSection}
          openReportsCount={openReportsCount}
          onLogout={onLogout}
          officerName={officerName}
          officerUnit={officerUnit}
          officerRole={officerRole}
        />
      </aside>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="gov-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
            />

            <motion.div
              key="gov-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="absolute right-3 top-4">
                <button
                  type="button"
                  onClick={onMobileClose}
                  aria-label="Tutup menu"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              <GovSidebarContent
                activeSection={activeSection}
                onSelectSection={onSelectSection}
                openReportsCount={openReportsCount}
                onLogout={onLogout}
                officerName={officerName}
                officerUnit={officerUnit}
                officerRole={officerRole}
                onItemClick={onMobileClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
