"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { AnimatePresence } from "framer-motion";
import { Menu, Home } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useOfflineDetection();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-[#2D5F3F] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar: hamburger only, hidden on lg */}
        <header className="flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 lg:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:ring-offset-2"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <Image src="/logo.png" alt="PACUL" width={100} height={32} className="ml-3 h-8 w-auto object-contain" />
          </div>
          <Link
            href="/"
            aria-label="Back to home page"
            className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-[#2D5F3F] hover:bg-[#F0FAF4] hover:text-[#2D5F3F] transition-colors"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6" role="main">
          <ErrorBoundary>
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
