"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { teamConfig } from "@/config/site";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useHydrated } from "@/hooks/useHydrated";
import { useStepTrackerStore } from "@/store/stepTracker.store";
import { DASHBOARD_NAV } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";

/* ── Shared nav content ── */
function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const isLiveTracking = useStepTrackerStore((s) => s.isTracking);
  const hydrated = useHydrated();
  const balance = useEcoPointsStore((s) => s.balance);
  const { logoutMutation } = useAuth();

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo & Penanda Peran Warga */}
        <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-4">
          <Link href="/" onClick={onLinkClick} aria-label="Beranda PACUL" className="transition-opacity hover:opacity-90">
            <Image src="/logo.png" alt="PACUL" width={110} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
            Warga
          </span>
        </div>

        <Link
          href="/dashboard/marketplace"
          onClick={onLinkClick}
          className="mx-3 mt-3 flex items-center justify-between rounded-lg bg-[#F0FAF4] px-3 py-2 text-xs hover:bg-[#E3F4E9]"
        >
          <span className="font-semibold text-gray-600">EcoPoints</span>
          <span className="font-extrabold text-[#2D5F3F]" aria-live="polite">
            {hydrated ? balance.toLocaleString("id-ID") : "-"}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="p-3" aria-label="Dashboard">
          <ul className="flex flex-col gap-1">
            {DASHBOARD_NAV.map(({ label, icon: Icon, href, exact, group, ...rest }, idx) => {
              const live = "live" in rest ? rest.live : undefined;
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              const firstMore = group === "more" && DASHBOARD_NAV[idx - 1]?.group === "primary";
              return (
                <li key={href}>
                  {firstMore && (
                    <p className="mb-1 mt-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Fitur Pendukung
                    </p>
                  )}
                  <Link
                    href={href}
                    onClick={onLinkClick}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-1",
                      isActive ? "bg-[#A8D5BA] text-[#2D5F3F] font-bold" : "text-gray-600 hover:bg-[#F5F5F5] hover:text-[#2D5F3F]"
                    )}
                  >
                    <Icon size={18} aria-hidden="true" className={cn("shrink-0", isActive ? "text-[#2D5F3F]" : "text-gray-400")} />
                    <span className="flex-1">{label}</span>
                    {live && isLiveTracking && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white leading-none">
                        LIVE
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Navigasi Bawah (Hanya 1 Tombol Keluar Akun) */}
      <div className="border-t border-[#E5E7EB] p-4 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (onLinkClick) onLinkClick();
            logoutMutation.mutate();
          }}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <LogOut size={15} />
          <span>Keluar Akun</span>
        </button>

        <div className="pt-0.5 text-center">
          <p className="text-[11px] text-gray-500 font-medium">© 2026 PACUL · {teamConfig.teamName}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">UPN &ldquo;Veteran&rdquo; Jawa Timur</p>
        </div>
      </div>
    </div>
  );
}

/* ── Desktop sidebar (sticky 100vh height, always visible on lg+) ── */
function DesktopSidebar() {
  return (
    <aside
      className="sticky top-0 h-screen hidden w-64 shrink-0 border-r border-[#E5E7EB] bg-white lg:block overflow-y-auto"
      aria-label="Navigasi Utama"
    >
      <SidebarContent />
    </aside>
  );
}

/* ── Mobile drawer (overlay) ── */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          />

          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi Mobile"
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl lg:hidden overflow-y-auto"
          >
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={onClose}
                aria-label="Tutup navigasi"
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent onLinkClick={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <>
      <DesktopSidebar />
      {onMobileClose && <MobileDrawer open={mobileOpen} onClose={onMobileClose} />}
    </>
  );
}
