"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { useHydrated } from "@/hooks/useHydrated";
import { PUBLIC_NAV } from "@/config/navigation";
import { teamConfig } from "@/config/site";

export default function Navbar() {
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const signedIn = hydrated && isAuthenticated;

  return (
    <>
      {/* Header Korporat & Civic-Tech Elegan, Luas & Berkarakter */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-950/[0.07] bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(15,61,46,0.04)] transition-all">
        {/* Aksen Garis Atas Identitas Hijau Presisi */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700" />

        <nav
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
          aria-label="Navigasi Utama"
        >
          {/* Brand PACUL */}
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-90"
            aria-label="Beranda PACUL"
          >
            <Image
              src="/logo.png"
              alt="PACUL"
              width={132}
              height={44}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Menu Navigasi Tengah: Bersih, Renggang & Rapi (Tidak Numpuk) */}
          <ul className="hidden items-center gap-8 lg:gap-10 md:flex">
            {PUBLIC_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0F3D2E]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Aksi Kanan: Tombol Presisi Korporat & Tegas */}
          <div className="hidden items-center gap-3 md:flex">
            {signedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-full border border-emerald-800/15 bg-emerald-50/80 px-4 py-2 text-xs font-bold text-[#0F3D2E] transition-all hover:bg-emerald-100/70"
                >
                  Portal Warga
                </Link>

                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="rounded-full px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-emerald-50/60 hover:text-[#0F3D2E]"
                >
                  <span>Masuk Akun</span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#0F3D2E]/20 transition-all hover:bg-[#18533F] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Eksplorasi Demo</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Tombol Menu Mobile */}
          <button
            type="button"
            className="rounded-xl border border-gray-200 p-2.5 text-[#0F3D2E] hover:bg-gray-100 md:hidden"
            aria-label="Buka menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      {/* Drawer Mobile Rapi */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-white shadow-2xl"
            >
              <div className="flex h-[72px] items-center justify-between border-b border-gray-100 px-6">
                <Image
                  src="/logo.png"
                  alt="PACUL"
                  width={110}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup menu"
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <ul className="flex-1 overflow-y-auto p-4 space-y-1">
                {PUBLIC_NAV.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#0F3D2E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2.5 border-t border-gray-100 p-5">
                {signedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-[#0F3D2E] py-3 text-center text-sm font-bold text-white shadow-xs"
                    >
                      Buka Portal Warga
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        logoutMutation.mutate();
                      }}
                      className="rounded-full border border-gray-200 py-3 text-center text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Keluar Akun
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-[#0F3D2E] py-3 text-center text-sm font-bold text-white shadow-xs"
                    >
                      Eksplorasi Demo
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-gray-200 py-3 text-center text-sm font-bold text-[#0F3D2E]"
                    >
                      Masuk Akun
                    </Link>
                  </>
                )}
                <p className="mt-2 text-center text-[10px] text-gray-400">
                  © 2026 PACUL · {teamConfig.teamName}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
