"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, MapPin, CheckCircle, Camera, Store, Map as MapIcon, Sprout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { SURABAYA_KECAMATAN } from "@/config/surabaya";
import { siteConfig } from "@/config/site";

const AVATAR_COLORS = ["#2D5F3F","#7AC74F","#A8D5BA","#F4A261","#F59E0B","#6366F1"];

const step1Schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  kecamatan: z.string().optional(),
  bio: z.string().max(150, "Bio can be at most 150 characters").optional(),
  agree: z.literal(true, { errorMap: () => ({ message: "Please accept the prototype terms and privacy notice" }) }),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length < 8) return { score: 1, label: "Very weak", color: "#EF4444" };
  const hasNum = /\d/.test(pw);
  const hasSym = /[^a-zA-Z0-9]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  if (hasNum && hasSym && hasUpper) return { score: 4, label: "Strong", color: "#2D5F3F" };
  if (hasNum && hasSym) return { score: 3, label: "Medium", color: "#4D7C0F" };
  if (hasNum || hasSym) return { score: 2, label: "Weak", color: "#B45309" };
  return { score: 1, label: "Very weak", color: "#EF4444" };
}

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? color : "#E5E7EB" }}
          />
        ))}
      </div>
      <p className="mt-0.5 text-[11px]" style={{ color }}>{label}</p>
    </div>
  );
}

function WelcomeModal({ name, initials, color, onStart }: {
  name: string; initials: string; color: string; onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div
          className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-extrabold text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">Welcome to PACUL, {name}!</h2>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#F0FAF4] p-3">
          <Sprout size={20} className="shrink-0 text-[#2D5F3F]" aria-hidden="true" />
          <div className="text-left">
            <p className="text-xs font-semibold text-[#2D5F3F]">Your first step</p>
            <p className="text-xs text-gray-500">Verify a green action to earn your first EcoPoints.</p>
          </div>
          <CheckCircle size={18} className="ml-auto text-[#2D5F3F]" />
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-[#2D5F3F] py-3 text-sm font-semibold text-white hover:bg-[#245033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
        >
          Go to my dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { registerMutation, updateUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; initials: string } | null>(null);

  const form1 = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Values>({ resolver: zodResolver(step2Schema) });

  const pw = form1.watch("password") ?? "";
  const bio = form2.watch("bio") ?? "";

  const onStep1 = (values: Step1Values) => {
    setStep1Data(values);
    setStep(2);
  };

  const onStep2 = async (values: Step2Values) => {
    if (!step1Data) return;
    const result = await registerMutation.mutateAsync({
      name: step1Data.name,
      email: step1Data.email,
      password: step1Data.password,
      password_confirmation: step1Data.confirmPassword,
      city: siteConfig.pilotCity,
      location: siteConfig.pilotCity,
      kecamatan: values.kecamatan || undefined,
      bio: values.bio,
    });
    updateUser({ avatarColor });
    const initials = step1Data.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    setNewUser({ name: result.user.name, initials });
    setShowWelcome(true);
  };

  return (
    <>
      {showWelcome && newUser && (
        <WelcomeModal
          name={newUser.name}
          initials={newUser.initials}
          color={avatarColor}
          onStart={() => router.push("/dashboard")}
        />
      )}

      <div className="flex min-h-screen">
        {/* ── Left panel ── */}
        <div
          className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center gap-8 p-12"
          style={{ background: "linear-gradient(145deg, #1a3d28 0%, #2D5F3F 55%, #3a7a52 100%)" }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <Image src="/logo-white.png" alt="PACUL" width={180} height={60} className="h-16 w-auto object-contain" />
            <p className="text-base font-medium text-white/80">Be part of a greener Surabaya, one action at a time</p>
          </div>

          <div className="grid w-full max-w-xs gap-3">
            {[
              { Icon: Camera, text: "Verify green actions with photo evidence" },
              { Icon: Store, text: "Earn EcoPoints to redeem at local UMKM" },
              { Icon: MapIcon, text: "See your district's impact on the map" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                <item.Icon size={18} className="shrink-0 text-[#B8EB9C]" aria-hidden="true" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <Image src="/logo.png" alt="PACUL" width={140} height={48} className="h-12 w-auto object-contain" />
          </div>

          <div className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Create your account</h1>
              <p className="mt-1 text-sm text-gray-500">A prototype account that lives only in this browser</p>
            </div>

            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step} of 2`}>
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className="h-2.5 w-2.5 rounded-full transition-all duration-300"
                  style={{ backgroundColor: s <= step ? "#2D5F3F" : "#E5E7EB", transform: s === step ? "scale(1.3)" : "scale(1)" }}
                  aria-current={s === step ? "step" : undefined}
                />
              ))}
              <span className="ml-1 text-xs text-gray-400">Step {step} of 2</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={form1.handleSubmit(onStep1)}
                  className="flex flex-col gap-4"
                  noValidate
                >
                  {/* Name */}
                  <div>
                    <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-gray-700">Display name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        id="reg-name"
                        type="text"
                        autoComplete="name"
                        placeholder="How should we call you?"
                        {...form1.register("name")}
                        className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                      />
                    </div>
                    {form1.formState.errors.name && (
                      <p className="mt-1 text-xs text-red-500">{form1.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...form1.register("email")}
                        className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                      />
                    </div>
                    {form1.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-500">{form1.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        {...form1.register("password")}
                        className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <StrengthBar password={pw} />
                    {form1.formState.errors.password && (
                      <p className="mt-1 text-xs text-red-500">{form1.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        id="reg-confirm"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        {...form1.register("confirmPassword")}
                        className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form1.formState.errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{form1.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    className="mt-1 w-full rounded-lg bg-[#2D5F3F] py-3 text-sm font-semibold text-white hover:bg-[#245033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                  >
                    Continue →
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={form2.handleSubmit(onStep2)}
                  className="flex flex-col gap-4"
                  noValidate
                >
                  {/* City (pilot) */}
                  <div className="flex items-center gap-2 rounded-lg bg-[#F0FAF4] px-3 py-2.5 text-sm text-[#2D5F3F]">
                    <MapPin size={16} aria-hidden="true" />
                    <span><strong>City: Surabaya.</strong> PACUL is currently a Surabaya pilot.</span>
                  </div>

                  {/* Kecamatan */}
                  <div>
                    <label htmlFor="reg-kecamatan" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Kecamatan / district <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <select
                      id="reg-kecamatan"
                      defaultValue=""
                      {...form2.register("kecamatan")}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 px-4 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                    >
                      <option value="">Prefer not to say</option>
                      {SURABAYA_KECAMATAN.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Used only to attribute your verified actions to a district on the impact map.</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="reg-bio" className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
                      Bio
                      <span className="text-xs font-normal text-gray-400">{bio.length}/150</span>
                    </label>
                    <textarea
                      id="reg-bio"
                      rows={3}
                      maxLength={150}
                      placeholder="A short line about you (optional)"
                      {...form2.register("bio")}
                      className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                    />
                  </div>

                  {/* Avatar color */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Avatar colour</p>
                    <div className="flex gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setAvatarColor(c)}
                          aria-label={`Choose avatar colour ${c}`}
                          aria-pressed={avatarColor === c}
                          className="h-8 w-8 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                          style={{
                            backgroundColor: c,
                            borderColor: avatarColor === c ? "#1A1A1A" : "transparent",
                            transform: avatarColor === c ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Agree */}
                  <div className="flex items-start gap-2">
                    <input
                      id="reg-agree"
                      type="checkbox"
                      {...form2.register("agree")}
                      className="mt-0.5 h-4 w-4 cursor-pointer accent-[#2D5F3F]"
                    />
                    <label htmlFor="reg-agree" className="cursor-pointer text-sm text-gray-600">
                      I understand this is a prototype and accept the{" "}
                      <Link href="/#privacy" className="font-medium text-[#2D5F3F] underline">privacy notice</Link>
                    </label>
                  </div>
                  {form2.formState.errors.agree && (
                    <p className="-mt-2 text-xs text-red-500">{form2.formState.errors.agree.message}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-gray-600 transition hover:border-[#2D5F3F] hover:text-[#2D5F3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                    >
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={registerMutation.isPending}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2D5F3F] py-3 text-sm font-semibold text-white hover:bg-[#245033] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating account…
                        </>
                      ) : "Create account"}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#2D5F3F] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
