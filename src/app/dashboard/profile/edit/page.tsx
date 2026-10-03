"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Trash2, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import Link from "next/link";
import PageWrapper from "@/components/common/PageWrapper";
import type { UserPreferences } from "@/store/auth.store";
import { SURABAYA_KECAMATAN } from "@/config/surabaya";
import { compressImageToDataUrl } from "@/lib/image-client";
import { usePushNotification } from "@/hooks/usePushNotification";
import Cookies from "js-cookie";
import { CITIZEN_COOKIE } from "@/hooks/useAuth";

function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") return (e as { message: string }).message;
  return fallback;
}

const AVATAR_COLORS = ["#2D5F3F","#7AC74F","#A8D5BA","#F4A261","#F59E0B","#6366F1"];

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(60, "Nama terlalu panjang"),
  kecamatan: z.string().optional(),
  bio: z.string().max(150, "Bio maksimal 150 karakter").optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const pwSchema = z.object({
  current_password: z.string().min(1, "Wajib diisi"),
  password: z.string().min(8, "Minimal 8 karakter"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Konfirmasi kata sandi tidak cocok", path: ["password_confirmation"],
});
type PwForm = z.infer<typeof pwSchema>;

function getStrength(pw: string) {
  if (pw.length < 8) return { score: 1, color: "#EF4444", label: "Sangat lemah" };
  const n = /\d/.test(pw), s = /[^a-zA-Z0-9]/.test(pw), u = /[A-Z]/.test(pw);
  if (n && s && u) return { score: 4, color: "#2D5F3F", label: "Kuat" };
  if (n && s) return { score: 3, color: "#4D7C0F", label: "Sedang" };
  if (n || s) return { score: 2, color: "#B45309", label: "Lemah" };
  return { score: 1, color: "#EF4444", label: "Sangat lemah" };
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
      style={{ backgroundColor: checked ? "#2D5F3F" : "#D1D5DB" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: checked ? "translateX(1.375rem)" : "translateX(0.125rem)" }}
      />
    </button>
  );
}

export default function ProfileEditPage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const push = usePushNotification();

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? AVATAR_COLORS[0]);
  const [prefs, setPrefs] = useState<UserPreferences>({
    notifications: true,
    publicProfile: true,
    weeklyReport: true,
    badgeNotifications: true,
    ...user?.preferences,
  });
  const [showPwSection, setShowPwSection] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      kecamatan: user?.kecamatan ?? "",
      bio: user?.bio ?? "",
    },
  });

  const pwForm = useForm<PwForm>({ resolver: zodResolver(pwSchema) });
  const bioVal = watch("bio") ?? "";
  const newPw = pwForm.watch("password") ?? "";
  const strength = getStrength(newPw);

  const debouncedSave = useCallback((data: ProfileForm) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setSaveStatus("saving");
    const t = setTimeout(async () => {
      try {
        await authService.updateProfile({ ...data, location: "Surabaya", preferences: prefs, avatarColor });
        updateUser({ ...data, location: "Surabaya", preferences: prefs, avatarColor });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        updateUser({ ...data, location: "Surabaya", preferences: prefs, avatarColor });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    }, 1500);
    setDebounceTimer(t);
  }, [debounceTimer, prefs, avatarColor, updateUser]);

  useEffect(() => {
    return () => { if (debounceTimer) clearTimeout(debounceTimer); };
  }, [debounceTimer]);

  const onProfileChange = handleSubmit(debouncedSave, () => {});

  const handleAvatarFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran foto maksimal 5 MB"); return; }
    setUploadingAvatar(true);
    try {
      // Small, EXIF-free data URL so the photo survives reloads in demo mode.
      const dataUrl = await compressImageToDataUrl(file, 256, 0.8);
      setAvatarPreview(dataUrl);
      updateUser({ avatarUrl: dataUrl });
      toast.success("Foto profil berhasil diperbarui");
    } catch (e) {
      toast.error(errorMessage(e, "Foto tidak dapat diproses"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePw = async (data: PwForm) => {
    try {
      await authService.changePassword(data);
      toast.success("Kata sandi berhasil diubah");
      pwForm.reset();
      setShowPwSection(false);
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Gagal mengubah kata sandi"));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    try {
      await authService.deleteAccount();
      Cookies.remove(CITIZEN_COOKIE);
      localStorage.removeItem(CITIZEN_COOKIE);
      localStorage.removeItem("pacul-auth");
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } catch (e) {
      toast.error(errorMessage(e, "Gagal menghapus akun"));
    }
  };

  const togglePref = async (key: keyof UserPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    updateUser({ preferences: next });
    authService.updateProfile({ preferences: next }).catch(() => undefined);
    if (key === "notifications" && next.notifications) await push.requestPermission();
  };

  const initials = user ? (user.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()) : "??";

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">Edit Profil</h1>
            <p className="mt-0.5 text-sm text-gray-500">Kelola informasi akun dan preferensi aplikasi Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {saveStatus === "saving" && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" /> Menyimpan…
                </motion.span>
              )}
              {saveStatus === "saved" && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-[#2D5F3F]">
                  <Check size={12} /> Tersimpan
                </motion.span>
              )}
            </AnimatePresence>
            <Link href="/dashboard/profile" className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              Kembali
            </Link>
          </div>
        </div>

        {/* SECTION 1: Avatar */}
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Foto Profil</h2>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Foto profil" width={96} height={96} className="h-24 w-24 rounded-full object-cover" unoptimized />
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold text-white shadow"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-[#2D5F3F] px-3 py-1.5 text-xs font-medium text-[#2D5F3F] hover:bg-[#F0FAF4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                >
                  <Camera size={14} /> Ubah Foto
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => { setAvatarPreview(null); updateUser({ avatarUrl: undefined }); }}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    <Trash2 size={14} /> Hapus Foto
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); }}
              />
              {!avatarPreview && (
                <div>
                  <p className="mb-1.5 text-xs text-gray-500">Warna Avatar</p>
                  <div className="flex gap-1.5">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c} type="button"
                        onClick={() => { setAvatarColor(c); updateUser({ avatarColor: c }); }}
                        aria-label={`Pilih warna ${c}`}
                        aria-pressed={avatarColor === c}
                        className="h-7 w-7 rounded-full border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-1"
                        style={{ backgroundColor: c, borderColor: avatarColor === c ? "#1A1A1A" : "transparent", transform: avatarColor === c ? "scale(1.2)" : "scale(1)" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-gray-400">Maksimal 5 MB · Format JPG, PNG, atau WebP</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Info Pribadi */}
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Informasi Pribadi</h2>
          <form onChange={onProfileChange} className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-name" className="mb-1.5 block text-xs font-medium text-gray-600">Nama Lengkap</label>
              <input
                id="edit-name"
                {...register("name")}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email: disabled */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-email" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                Alamat Email
                <Lock size={11} className="text-gray-400" aria-hidden="true" />
                <span className="font-normal text-gray-400">(tidak dapat diubah)</span>
              </label>
              <input
                id="edit-email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-gray-50 px-3 py-2.5 text-sm text-gray-400"
              />
            </div>

            {/* Location */}
            <div>
              <p className="mb-1.5 block text-xs font-medium text-gray-600">Kota</p>
              <p className="rounded-lg bg-[#F0FAF4] px-3 py-2.5 text-sm font-medium text-[#2D5F3F]">Surabaya (Wilayah Pilot)</p>
            </div>

            {/* Kecamatan */}
            <div>
              <label htmlFor="edit-kecamatan" className="mb-1.5 block text-xs font-medium text-gray-600">Kecamatan (Opsional)</label>
              <select
                id="edit-kecamatan"
                {...register("kecamatan")}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
              >
                <option value="">Pilih kecamatan tempat tinggal</option>
                {SURABAYA_KECAMATAN.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
              </select>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label htmlFor="edit-bio" className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-600">
                Bio Profil
                <span className="font-normal text-gray-400">{bioVal.length}/150</span>
              </label>
              <textarea
                id="edit-bio"
                rows={3}
                maxLength={150}
                {...register("bio")}
                placeholder="Ceritakan singkat tentang diri Anda (opsional)"
                className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
              />
            </div>
          </form>
        </div>

        {/* SECTION 3: Preferensi */}
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Preferensi Akun</h2>
          <div className="flex flex-col gap-4">
            {([
              { key: "publicProfile" as const, label: "Tampilkan di Papan Peringkat", desc: "Tampilkan nama Anda pada daftar leaderboard warga Surabaya" },
              { key: "notifications" as const, label: "Notifikasi Web Browser", desc: "Menerima pengingat aksi dan pengumuman komunitas" },
              { key: "weeklyReport" as const, label: "Ringkasan Mingguan", desc: "Simpan preferensi untuk menerima ringkasan capaian hijau" },
              { key: "badgeNotifications" as const, label: "Notifikasi Lencana", desc: "Pemberitahuan ketika Anda membuka pencapaian baru" },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <Toggle
                  checked={prefs[key]}
                  onChange={() => togglePref(key)}
                  label={label}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Keamanan */}
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowPwSection((v) => !v)}
            className="flex w-full items-center justify-between focus-visible:outline-none"
            aria-expanded={showPwSection}
          >
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Ubah Kata Sandi</h2>
            {showPwSection ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {showPwSection && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={pwForm.handleSubmit(handleChangePw)}
                className="mt-4 flex flex-col gap-4 overflow-hidden"
                noValidate
              >
                {/* Current password */}
                <div>
                  <label htmlFor="pw-current" className="mb-1.5 block text-xs font-medium text-gray-600">Kata sandi saat ini</label>
                  <div className="relative">
                    <input
                      id="pw-current"
                      type={showCurrentPw ? "text" : "password"}
                      {...pwForm.register("current_password")}
                      className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                    />
                    <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                      aria-label={showCurrentPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.formState.errors.current_password && (
                    <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors.current_password.message}</p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label htmlFor="pw-new" className="mb-1.5 block text-xs font-medium text-gray-600">Kata sandi baru</label>
                  <div className="relative">
                    <input
                      id="pw-new"
                      type={showNewPw ? "text" : "password"}
                      {...pwForm.register("password")}
                      className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                    />
                    <button type="button" onClick={() => setShowNewPw((v) => !v)}
                      aria-label={showNewPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPw && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                            style={{ backgroundColor: i <= strength.score ? strength.color : "#E5E7EB" }} />
                        ))}
                      </div>
                      <p className="mt-0.5 text-[11px]" style={{ color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                  {pwForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="pw-confirm" className="mb-1.5 block text-xs font-medium text-gray-600">Konfirmasi kata sandi baru</label>
                  <div className="relative">
                    <input
                      id="pw-confirm"
                      type={showConfirmPw ? "text" : "password"}
                      {...pwForm.register("password_confirmation")}
                      className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                    />
                    <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                      aria-label={showConfirmPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.formState.errors.password_confirmation && (
                    <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors.password_confirmation.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pwForm.formState.isSubmitting}
                  className="self-start rounded-lg bg-[#2D5F3F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245033] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                >
                  {pwForm.formState.isSubmitting ? "Menyimpan…" : "Simpan Kata Sandi"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 5: Danger Zone */}
        <div className="rounded-[12px] border border-red-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-red-600">Hapus Akun</h2>
          <p className="mb-4 text-xs text-gray-400">Menghapus akun akan membersihkan data sesi dari peramban ini secara permanen.</p>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <Trash2 size={14} /> Hapus Akun Saya
          </button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 id="delete-dialog-title" className="text-base font-bold text-red-600">Hapus Akun Secara Permanen</h3>
              <p className="mt-2 text-sm text-gray-600">
                Seluruh data sesi akun akan dibersihkan. Ketik <strong>DELETE</strong> untuk mengonfirmasi.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Ketik DELETE"
                aria-label="Ketik DELETE untuk konfirmasi"
                className="mt-4 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowDeleteDialog(false); setDeleteInput(""); }}
                  className="flex-1 rounded-lg border border-[#E5E7EB] py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deleteInput !== "DELETE"}
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Hapus Akun
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
