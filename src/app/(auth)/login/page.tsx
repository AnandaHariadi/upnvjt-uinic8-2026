"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGovAuthStore } from "@/store/govAuth.store";
import { siteConfig, teamConfig } from "@/config/site";
import { DEMO_ACCOUNT, DEMO_GOV_ACCOUNT } from "@/lib/demo-mode";

type RoleType = "warga" | "gov";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFDFB]" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "gov" ? "gov" : "warga";
  const [selectedRole, setSelectedRole] = useState<RoleType>(initialRole);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "gov") setSelectedRole("gov");
    else if (roleParam === "warga") setSelectedRole("warga");
  }, [searchParams]);

  // Auth Hooks
  const { demoLogin: citizenDemoLogin, loginMutation: citizenLoginMutation } = useAuth();
  const govLogin = useGovAuthStore((s) => s.login);

  // Form States (Clean & Typed)
  const [citizenEmail, setCitizenEmail] = useState<string>(DEMO_ACCOUNT.email);
  const [citizenPassword, setCitizenPassword] = useState<string>(DEMO_ACCOUNT.password);
  const [showCitizenPass, setShowCitizenPass] = useState(false);
  const [citizenLoading, setCitizenLoading] = useState(false);

  const [govEmail, setGovEmail] = useState<string>(DEMO_GOV_ACCOUNT.email);
  const [govPassword, setGovPassword] = useState<string>(DEMO_GOV_ACCOUNT.password);
  const [showGovPass, setShowGovPass] = useState(false);
  const [govLoading, setGovLoading] = useState(false);

  // Warga Demo Login
  const handleCitizenDemo = async () => {
    try {
      setCitizenLoading(true);
      await citizenDemoLogin("/dashboard");
    } catch {
      toast.error("Gagal memulai demo warga. Silakan coba lagi.");
    } finally {
      setCitizenLoading(false);
    }
  };

  // Warga Manual Submit
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenEmail || !citizenPassword) {
      toast.error("Email dan kata sandi wajib diisi.");
      return;
    }
    try {
      setCitizenLoading(true);
      await citizenLoginMutation.mutateAsync({
        email: citizenEmail,
        password: citizenPassword,
        redirectTo: "/dashboard",
      });
    } catch {
      toast.error("Email atau kata sandi tidak sesuai.");
    } finally {
      setCitizenLoading(false);
    }
  };

  // Gov Demo Login
  const handleGovDemo = async () => {
    try {
      setGovLoading(true);
      const res = await govLogin(DEMO_GOV_ACCOUNT.email, DEMO_GOV_ACCOUNT.password);
      if (res.success) {
        toast.success("Masuk sebagai Petugas DLH (Demo)");
        router.push("/gov/dashboard");
      } else {
        toast.error(res.error || "Gagal masuk portal.");
      }
    } catch {
      toast.error("Kendala autentikasi.");
    } finally {
      setGovLoading(false);
    }
  };

  // Gov Manual Submit
  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govEmail || !govPassword) {
      toast.error("Email dinas dan kata sandi wajib diisi.");
      return;
    }
    try {
      setGovLoading(true);
      const res = await govLogin(govEmail, govPassword);
      if (res.success) {
        toast.success("Berhasil masuk");
        router.push("/gov/dashboard");
      } else {
        toast.error(res.error || "Email atau kata sandi tidak sesuai.");
      }
    } catch {
      toast.error("Kendala autentikasi.");
    } finally {
      setGovLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFDFB]">
      {/* ── Panel Kiri: Informasi Singkat & Elegan (Desktop) ── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #0A261C 0%, #0F3D2E 50%, #155741 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col items-start gap-3">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <Image
              src="/logo-white.png"
              alt="PACUL"
              width={150}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
            Kota Surabaya
          </span>
        </div>

        <div className="relative z-10 my-auto py-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
              Kolaborasi Lingkungan Berbasis Aksi Nyata
            </h2>
            <p className="text-sm leading-relaxed text-emerald-100/75">
              Menghubungkan kebiasaan ramah lingkungan warga dengan respon cepat dan analitik tata kota Surabaya.
            </p>
          </div>

          <div className="grid gap-3">
            {/* Card Role 1: Warga */}
            <button
              type="button"
              onClick={() => setSelectedRole("warga")}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                selectedRole === "warga"
                  ? "border-emerald-400/80 bg-white/10 shadow-lg"
                  : "border-white/10 bg-white/[0.03] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <User size={16} className="text-emerald-300" />
                  Warga Surabaya
                </span>
                {selectedRole === "warga" && (
                  <span className="text-xs font-semibold text-emerald-300">Aktif</span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed">
                Pilah sampah mandiri, catat aksi hijau, dan tukar EcoPoints untuk voucher belanja di warung UMKM.
              </p>
            </button>

            {/* Card Role 2: Pemkot */}
            <button
              type="button"
              onClick={() => setSelectedRole("gov")}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                selectedRole === "gov"
                  ? "border-emerald-400/80 bg-white/10 shadow-lg"
                  : "border-white/10 bg-white/[0.03] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <Building2 size={16} className="text-emerald-300" />
                  Dinas Lingkungan Hidup
                </span>
                {selectedRole === "gov" && (
                  <span className="text-xs font-semibold text-emerald-300">Aktif</span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed">
                Pemantauan data spasial 31 kecamatan, respon laporan timbulan sampah, dan koordinasi armada kebersihan.
              </p>
            </button>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-emerald-100/60">
          <span>{teamConfig.teamName}</span>
          <span>UPN &ldquo;Veteran&rdquo; Jawa Timur</span>
        </div>
      </div>

      {/* ── Panel Kanan: Form Masuk ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        {/* Header Mobile Brand */}
        <div className="mb-6 flex flex-col items-center gap-1 lg:hidden">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="PACUL"
              width={120}
              height={38}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Segment Selector Peran */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-gray-200 bg-gray-100/80 p-1">
              <button
                type="button"
                onClick={() => setSelectedRole("warga")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  selectedRole === "warga"
                    ? "bg-[#0F3D2E] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User size={15} />
                <span>Warga Surabaya</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("gov")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  selectedRole === "gov"
                    ? "bg-[#0F3D2E] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Building2 size={15} />
                <span>Petugas DLH</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedRole === "warga" ? (
              /* ═══════════ FORM WARGA SURABAYA ═══════════ */
              <motion.div
                key="role-warga"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-black tracking-tight text-[#0F3D2E]">
                    Masuk Akun Warga
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                    Akses verifikasi aksi hijau, saldo EcoPoints, dan katalog voucher UMKM.
                  </p>
                </div>

                {/* Tombol Demo Cepat */}
                <button
                  type="button"
                  onClick={handleCitizenDemo}
                  disabled={citizenLoading}
                  className="group flex w-full flex-col items-start rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/60 p-4 text-left transition-all hover:border-[#1D9E75] hover:bg-emerald-50 active:scale-[0.99] disabled:opacity-60"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-bold text-[#0F3D2E]">
                      {citizenLoading ? "Mempersiapkan akun…" : "Masuk Cepat Demo: Rendra Pratama"}
                    </span>
                    <ArrowRight size={15} className="text-[#1D9E75] transition-transform group-hover:translate-x-1" />
                  </div>
                  <span className="mt-1 text-xs text-gray-500">
                    Simulasi warga Kecamatan Gubeng dengan saldo 1.250 poin aktif.
                  </span>
                </button>

                {/* Pembatas */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">atau email terdaftar</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Form Input */}
                <form onSubmit={handleCitizenSubmit} className="flex flex-col gap-4" noValidate>
                  <div>
                    <label htmlFor="citizen-email" className="mb-1 block text-xs font-bold text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="citizen-email"
                        type="email"
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        placeholder="demo@pacul.app"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="citizen-password" className="mb-1 block text-xs font-bold text-gray-700">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="citizen-password"
                        type={showCitizenPass ? "text" : "password"}
                        value={citizenPassword}
                        onChange={(e) => setCitizenPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-11 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCitizenPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showCitizenPass ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                      >
                        {showCitizenPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={citizenLoading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D2E] py-2.5 text-sm font-bold text-white transition hover:bg-[#18533F] disabled:opacity-50"
                  >
                    {citizenLoading ? "Memverifikasi…" : "Masuk"}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Belum memiliki akun?{" "}
                  <Link href="/register" className="font-bold text-[#1D9E75] hover:underline">
                    Daftar di sini
                  </Link>
                </p>
              </motion.div>
            ) : (
              /* ═══════════ FORM PETUGAS PEMKOT & DLH ═══════════ */
              <motion.div
                key="role-gov"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-black tracking-tight text-[#0F3D2E]">
                    Portal Pemkot Surabaya
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                    Akses pemantauan 31 kecamatan dan respon tiket kebersihan kota.
                  </p>
                </div>

                {/* Tombol Demo Cepat Pemkot */}
                <button
                  type="button"
                  onClick={handleGovDemo}
                  disabled={govLoading}
                  className="group flex w-full flex-col items-start rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/60 p-4 text-left transition-all hover:border-[#1D9E75] hover:bg-emerald-50 active:scale-[0.99] disabled:opacity-60"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-bold text-[#0F3D2E]">
                      {govLoading ? "Mempersiapkan akun…" : "Masuk Cepat Demo: Budi Hartono"}
                    </span>
                    <ArrowRight size={15} className="text-[#1D9E75] transition-transform group-hover:translate-x-1" />
                  </div>
                  <span className="mt-1 text-xs text-gray-500">
                    Simulasi petugas Dinas Lingkungan Hidup Surabaya.
                  </span>
                </button>

                {/* Pembatas */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">atau email dinas</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Form Input Dinas */}
                <form onSubmit={handleGovSubmit} className="flex flex-col gap-4" noValidate>
                  <div>
                    <label htmlFor="gov-email-input" className="mb-1 block text-xs font-bold text-gray-700">
                      Email Dinas
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="gov-email-input"
                        type="email"
                        value={govEmail}
                        onChange={(e) => setGovEmail(e.target.value)}
                        placeholder="gov-demo@pacul.app"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gov-password-input" className="mb-1 block text-xs font-bold text-gray-700">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="gov-password-input"
                        type={showGovPass ? "text" : "password"}
                        value={govPassword}
                        onChange={(e) => setGovPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-11 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowGovPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showGovPass ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                      >
                        {showGovPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={govLoading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D2E] py-2.5 text-sm font-bold text-white transition hover:bg-[#18533F] disabled:opacity-50"
                  >
                    {govLoading ? "Memverifikasi…" : "Masuk"}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Akses khusus petugas kedinasan DLH Surabaya.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 border-t border-gray-200 pt-4 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-[#0F3D2E] transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
