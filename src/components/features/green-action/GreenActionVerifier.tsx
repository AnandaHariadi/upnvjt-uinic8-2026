"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle, Camera, CheckCircle2, ImagePlus, Loader2, MapPin, RefreshCw, Share2, ShieldCheck, X,
} from "lucide-react";
import { GREEN_ACTION_LIST, GREEN_ACTIONS, type GreenActionType } from "@/config/green-actions";
import { findKecamatan } from "@/config/surabaya";
import {
  EvidenceError, getDistrictLocation, preSubmitCheck, prepareEvidence, requestVerification,
  type PreparedEvidence,
} from "@/lib/verification/client";
import { recordGreenAction, type RecordOutcome } from "@/services/greenAction.service";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useAuthStore } from "@/store/auth.store";
import { useCollaborationStore } from "@/store/collaboration.store";
import { makeInitials } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { GreenActionIcon } from "@/components/common/icons";
import DataBadge from "@/components/common/DataBadge";
import VerificationStatusBadge, { FLAG_COPY, STATUS_COPY } from "./VerificationStatusBadge";

type Phase = "idle" | "preparing" | "checking" | "analysing" | "done";

interface ServiceInfo {
  mode: "live" | "demo";
  available: boolean;
  provider: string;
}

const PHASE_LABEL: Record<Exclude<Phase, "idle" | "done">, string> = {
  preparing: "Menyiapkan foto bukti aksi…",
  checking: "Memeriksa parameter aksi…",
  analysing: "Menganalisis foto dengan AI…",
};

export default function GreenActionVerifier() {
  const [actionType, setActionType] = useState<GreenActionType>("waste_sorting");
  const def = GREEN_ACTIONS[actionType];
  const [quantity, setQuantity] = useState<number>(def.quantity.default);
  const [evidence, setEvidence] = useState<PreparedEvidence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null);
  const [shareLocation, setShareLocation] = useState(false);
  const [service, setService] = useState<ServiceInfo | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const history = useGreenActionStore((s) => s.actions);
  const user = useAuthStore((s) => s.user);
  const shareVerifiedAction = useCollaborationStore((s) => s.shareVerifiedAction);
  const markShared = useGreenActionStore((s) => s.markShared);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/eco-action/verify")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ServiceInfo | null) => { if (!cancelled && d) setService(d); })
      .catch(() => { /* status banner is optional */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => { if (evidence) URL.revokeObjectURL(evidence.previewUrl); }, [evidence]);

  useEffect(() => {
    if (phase === "done") resultRef.current?.focus();
  }, [phase]);

  const selectAction = (t: GreenActionType) => {
    setActionType(t);
    setQuantity(GREEN_ACTIONS[t].quantity.default);
    setError(null);
  };

  const onFile = async (file: File | undefined) => {
    setError(null);
    setPhase("preparing");
    try {
      const prepared = await prepareEvidence(file);
      setEvidence(prepared);
    } catch (e) {
      setError(e instanceof EvidenceError ? e.message : "Foto bukti tidak dapat diproses.");
    } finally {
      setPhase("idle");
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  };

  const reset = () => {
    setEvidence(null);
    setOutcome(null);
    setError(null);
    setPhase("idle");
  };

  const submit = async () => {
    if (!evidence) {
      setError("Silakan ambil atau pilih foto bukti terlebih dahulu.");
      return;
    }
    setError(null);
    setPhase("checking");
    const blocked = preSubmitCheck(actionType, evidence.hash, history);
    if (blocked) {
      setError(blocked);
      setPhase("idle");
      return;
    }

    let kecamatanId = user?.kecamatan ? findKecamatan(user.kecamatan)?.id : undefined;
    let outside = false;
    if (shareLocation) {
      const loc = await getDistrictLocation();
      if (loc.ok) {
        kecamatanId = loc.kecamatanId;
        outside = !loc.inside;
      } else {
        toast.info(loc.reason);
      }
    }

    setPhase("analysing");
    try {
      const response = await requestVerification(evidence, actionType);
      const result = recordGreenAction({
        actionType,
        quantity,
        response,
        evidenceHash: evidence.hash,
        thumbnail: evidence.thumbnail,
        kecamatanId,
        outsidePilotArea: outside,
      });
      setOutcome(result);
      setPhase("done");
      if (result.record.ecoPointsAwarded > 0) {
        toast.success(`+${result.record.ecoPointsAwarded} EcoPoints untuk aksi ${def.labelId}`);
      }
      for (const u of result.challengeUpdates) {
        if (u.completed) toast.success(`Tantangan selesai: ${u.challenge.title} (+${u.challenge.ecoPointsReward} EcoPoints)`);
      }
    } catch (e) {
      setError(e instanceof EvidenceError ? e.message : "Verifikasi gagal diproses. Silakan coba kembali.");
      setPhase("idle");
    }
  };

  const share = () => {
    if (!outcome || !user) return;
    const r = outcome.record;
    const impact = r.estimatedImpact;
    const impactSummary =
      `${impact.quantity} ${impact.unit}` +
      (impact.estimatedCo2eKg != null ? ` · cegah ${impact.estimatedCo2eKg} kg CO₂e` : "");
    shareVerifiedAction(
      { name: user.name, initials: user.avatarInitials ?? makeInitials(user.name), kecamatan: findKecamatan(r.location?.kecamatanId)?.name ?? "Surabaya" },
      `Menyelesaikan aksi ${def.labelId.toLowerCase()} hari ini.`,
      { actionId: r.actionId, actionType: r.actionType, mode: r.verificationMode, impactSummary }
    );
    markShared(r.actionId);
    toast.success("Berhasil dibagikan ke Forum Komunitas Warga");
  };

  const busy = phase === "preparing" || phase === "checking" || phase === "analysing";
  const record = outcome?.record;
  const alreadyShared = !!record && history.some((a) => a.actionId === record.actionId && a.sharedToCommunity);

  return (
    <section
      aria-labelledby="verify-heading"
      className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="verify-heading" className="text-base font-bold text-[#1A1A1A] sm:text-lg">
            Verifikasi Aksi Hijau Berbasis AI
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Pilih kategori aksi hijau, unggah bukti foto, dan peroleh verifikasi otomatis dari sistem.
          </p>
        </div>
        {service && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              service.mode === "demo" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
            )}
            title={service.provider}
          >
            <ShieldCheck size={12} aria-hidden="true" />
            {service.mode === "demo" ? "Mode Simulasi: Verifikasi teruji" : service.available ? "AI Aktif: Google Cloud Vision" : "AI Offline: Antrean tinjauan manual"}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase !== "done" ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            {/* Step 1: action */}
            <fieldset disabled={busy}>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">1. Pilih Kategori Aksi</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {GREEN_ACTION_LIST.map((a) => {
                  const active = a.type === actionType;
                  return (
                    <label
                      key={a.type}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 transition-colors focus-within:ring-2 focus-within:ring-[#2D5F3F] focus-within:ring-offset-1",
                        active ? "border-[#2D5F3F] bg-[#F0FAF4]" : "border-[#E5E7EB] hover:border-[#A8D5BA]"
                      )}
                    >
                      <input
                        type="radio"
                        name="green-action"
                        value={a.type}
                        checked={active}
                        onChange={() => selectAction(a.type)}
                        className="sr-only"
                      />
                      <GreenActionIcon type={a.type} size={24} />
                      <span className="text-xs font-bold leading-tight text-[#1A1A1A]">{a.labelId}</span>
                      <span className="mt-auto text-[11px] font-semibold text-[#2D5F3F]">+{a.ecoPoints} EcoPoints</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 rounded-lg bg-[#F9FAFB] px-3 py-2 text-xs text-gray-600">
                <span className="font-semibold text-gray-700">Kriteria bukti:</span> {def.evidenceRequirement}{" "}
                <span className="text-gray-400">· Batas {def.dailyLimit} kali per hari</span>
              </p>
            </fieldset>

            {/* Step 2: evidence */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">2. Unggah Foto Bukti</p>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <input
                ref={galleryRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => onFile(e.target.files?.[0])}
              />

              {evidence ? (
                <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={evidence.previewUrl} alt={`Foto bukti untuk ${def.labelId}`} className="mx-auto max-h-72 w-auto object-contain" />
                  <div className="flex items-center justify-between gap-2 border-t border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-gray-500">
                    <span>{evidence.width}×{evidence.height}px · {(evidence.upload.size / 1024).toFixed(0)} KB · Metadata dibersihkan</span>
                    <button
                      type="button"
                      onClick={() => setEvidence(null)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      <X size={12} aria-hidden="true" /> Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#A8D5BA] px-4 py-8 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
                >
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245033] disabled:opacity-60"
                    >
                      <Camera size={18} aria-hidden="true" /> Ambil Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2D5F3F] px-5 py-3 text-sm font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4] disabled:opacity-60"
                    >
                      <ImagePlus size={18} aria-hidden="true" /> Pilih dari Galeri
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">JPG, PNG, atau WebP · Foto dikompresi otomatis dan data GPS dibersihkan demi privasi.</p>
                </div>
              )}
            </div>

            {/* Step 3: details */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ga-quantity" className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  3. {def.quantity.label} ({def.quantity.unit})
                </label>
                <input
                  id="ga-quantity"
                  type="number"
                  inputMode="decimal"
                  min={def.quantity.min}
                  max={def.quantity.max}
                  step={def.quantity.step}
                  value={quantity}
                  disabled={busy}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
                />
                <p className="mt-1 text-[11px] text-gray-400">Estimasi mandiri, maksimal {def.quantity.max} {def.quantity.unit}. Digunakan untuk estimasi dampak lingkungan.</p>
              </div>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E5E7EB] p-3 text-sm">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  disabled={busy}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="mt-0.5 accent-[#2D5F3F]"
                />
                <span>
                  <span className="flex items-center gap-1 font-semibold text-gray-700"><MapPin size={13} aria-hidden="true" /> Sematkan Kecamatan Saya (Opsional)</span>
                  <span className="block text-[11px] text-gray-500">
                    Lokasi dipetakan ke wilayah kecamatan Anda. Titik koordinat GPS presisi tidak pernah disimpan.
                  </span>
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={busy || !evidence}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3.5 text-sm font-bold text-white transition hover:bg-[#245033] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
              {busy ? PHASE_LABEL[phase as keyof typeof PHASE_LABEL] : "Verifikasi Bukti Aksi"}
            </button>
            <p className="sr-only" aria-live="polite">{busy ? PHASE_LABEL[phase as keyof typeof PHASE_LABEL] : ""}</p>
          </motion.div>
        ) : (
          record && (
            <motion.div
              key="result"
              ref={resultRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 outline-none"
              aria-live="polite"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {record.evidenceThumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL thumbnail
                  <img src={record.evidenceThumbnail} alt="Bukti aksi diunggah" className="h-32 w-32 shrink-0 rounded-xl object-cover" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <VerificationStatusBadge status={record.verificationStatus} mode={record.verificationMode} size="md" />
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]"><GreenActionIcon type={actionType} size={16} /> {def.labelId}</span>
                    {record.verificationMode === "demo" && <DataBadge variant="simulated" />}
                  </div>
                  <p className="text-xs font-medium text-gray-500">{STATUS_COPY[record.verificationStatus].description}</p>
                  <p className="text-sm leading-relaxed text-gray-700">{record.verificationReason}</p>
                </div>
              </div>

              {record.verificationConfidence != null && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">Skor Kesesuaian Model AI</span>
                    <span className="font-bold text-[#1A1A1A]">{Math.round(record.verificationConfidence * 100)}%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-gray-100"
                    role="meter"
                    aria-label="Skor Kesesuaian Model AI"
                    aria-valuenow={Math.round(record.verificationConfidence * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full bg-[#2D5F3F]" style={{ width: `${record.verificationConfidence * 100}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Skor keyakinan model analisis gambar terhadap objek aksi hijau yang terdeteksi.
                  </p>
                </div>
              )}

              {record.flags.length > 0 && (
                <ul className="flex flex-col gap-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {record.flags.map((f) => (
                    <li key={f} className="flex items-start gap-1.5"><AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" /> {FLAG_COPY[f] ?? f}</li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#F0FAF4] p-3">
                  <p className="text-[11px] text-gray-500">{record.estimatedImpact.metric}</p>
                  <p className="text-lg font-extrabold text-[#2D5F3F]">
                    {record.estimatedImpact.quantity} {record.estimatedImpact.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F0FAF4] p-3">
                  <p className="text-[11px] text-gray-500">Estimasi Pengurangan CO₂e</p>
                  <p className="text-lg font-extrabold text-[#2D5F3F]">
                    {record.estimatedImpact.estimatedCo2eKg != null ? `${record.estimatedImpact.estimatedCo2eKg} kg` : "-"}
                  </p>
                  {record.estimatedImpact.estimatedCo2eKg == null && (
                    <p className="text-[10px] text-gray-400">Belum ada faktor konversi baku untuk aksi ini</p>
                  )}
                </div>
                <div className="rounded-xl bg-[#FFF8E6] p-3">
                  <p className="text-[11px] text-gray-500">EcoPoints Diterbitkan</p>
                  <p className="text-lg font-extrabold text-[#B7791F]">+{record.ecoPointsAwarded}</p>
                  {record.verificationStatus !== "verified" && (
                    <p className="text-[10px] text-gray-400">Diberikan setelah diverifikasi valid</p>
                  )}
                </div>
              </div>

              {outcome!.challengeUpdates.map((u) => (
                <p key={u.challenge.id} className="rounded-lg bg-[#F0FAF4] px-3 py-2 text-xs text-[#2D5F3F]">
                  {u.challenge.title}: {u.challenge.progress}/{u.challenge.target}
                  {u.completed && `, tantangan selesai! +${u.challenge.ecoPointsReward} EcoPoints`}
                </p>
              ))}

              <div className="flex flex-col gap-2 sm:flex-row">
                {record.verificationStatus === "verified" && !alreadyShared && (
                  <button
                    type="button"
                    onClick={share}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-semibold text-white hover:bg-[#245033]"
                  >
                    <Share2 size={15} aria-hidden="true" /> Bagikan ke Forum Warga
                  </button>
                )}
                <Link
                  href="/dashboard/marketplace"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#2D5F3F] py-3 text-sm font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4]"
                >
                  Tukar Voucher di Marketplace
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw size={14} aria-hidden="true" /> Verifikasi Aksi Lainnya
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </section>
  );
}
