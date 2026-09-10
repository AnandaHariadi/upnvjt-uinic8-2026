"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Camera, Check, CheckCircle, ChevronLeft, ChevronRight, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import {
  CATEGORY_CONFIG, SEVERITY_CONFIG, useWasteReportStore,
  type WasteCategory, type WasteSeverity,
} from "@/store/wasteReport.store";
import { useAuthStore } from "@/store/auth.store";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";
import { SURABAYA_KECAMATAN, findKecamatan, isInsideSurabaya, nearestKecamatan } from "@/config/surabaya";
import { compressImageToDataUrl } from "@/lib/image-client";
import { MapLoading } from "@/components/maps/MapLoading";
import { cn } from "@/utils/cn";
import { WasteCategoryIcon } from "@/components/common/icons";

const WasteMapCanvas = dynamic(() => import("./WasteMapCanvas"), { ssr: false, loading: () => <MapLoading className="h-64" /> });

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [WasteCategory, (typeof CATEGORY_CONFIG)[WasteCategory]][];
const SEVERITIES = Object.entries(SEVERITY_CONFIG) as [WasteSeverity, (typeof SEVERITY_CONFIG)[WasteSeverity]][];
const MAX_PHOTOS = 3;
/** Prototype fraud-mitigation rule: EcoPoints for at most this many reports per day. */
const REWARDED_REPORTS_PER_DAY = 2;

interface FormState {
  lat: number | null;
  lng: number | null;
  kecamatanId: string;
  address: string;
  title: string;
  category: WasteCategory | "";
  severity: WasteSeverity | "";
  description: string;
  photos: string[];
}

const INITIAL: FormState = {
  lat: null, lng: null, kecamatanId: "", address: "",
  title: "", category: "", severity: "", description: "", photos: [],
};

const STEPS = ["Lokasi", "Detail Laporan", "Foto Bukti"];

function StepBar({ step }: { step: number }) {
  return (
    <ol className="flex items-center" aria-label="Tahapan pembuatan laporan">
      {STEPS.map((l, i) => (
        <li key={l} className="flex flex-1 items-center" aria-current={i + 1 === step ? "step" : undefined}>
          <div className="flex flex-col items-center gap-1">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
              i + 1 <= step ? "bg-[#2D5F3F] text-white" : "bg-gray-100 text-gray-500")}>
              {i + 1 < step ? <Check size={14} aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn("text-[11px] font-semibold", i + 1 <= step ? "text-[#2D5F3F]" : "text-gray-500")}>{l}</span>
          </div>
          {i < STEPS.length - 1 && <span className={cn("mx-1 h-0.5 flex-1 rounded-full", i + 1 < step ? "bg-[#2D5F3F]" : "bg-gray-200")} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export default function CreateWasteReport({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; points: number } | null>(null);
  const addReport = useWasteReportStore((s) => s.addReport);
  const user = useAuthStore((s) => s.user);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const setPoint = (lat: number, lng: number) => {
    if (!isInsideSurabaya(lat, lng)) {
      toast.error("Titik tersebut berada di luar wilayah administratif Surabaya.");
      return;
    }
    const k = nearestKecamatan(lat, lng);
    patch({ lat, lng, kecamatanId: k.id });
  };

  const geolocate = () => {
    if (!navigator.geolocation) {
      toast.error("Layanan lokasi tidak tersedia pada perangkat ini. Silakan klik peta langsung.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        setPoint(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGeoLoading(false);
        toast.error(err.code === err.PERMISSION_DENIED ? "Akses lokasi ditolak. Silakan klik langsung pada peta." : "Lokasi tidak dapat ditentukan. Silakan klik peta.");
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoBusy(true);
    try {
      const room = MAX_PHOTOS - form.photos.length;
      const out: string[] = [];
      for (const f of Array.from(files).slice(0, room)) out.push(await compressImageToDataUrl(f));
      patch({ photos: [...form.photos, ...out] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menambahkan foto bukti.");
    } finally {
      setPhotoBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const step1Valid = form.lat !== null && form.lng !== null && !!form.kecamatanId;
  const step2Valid = form.title.trim().length >= 10 && !!form.category && !!form.severity && form.description.trim().length >= 20;
  const step3Valid = form.photos.length >= 1;

  const submit = async () => {
    if (!step3Valid || form.lat === null || form.lng === null) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const points = useEcoPointsStore.getState();
    const today = new Date().toDateString();
    const rewardedToday = points.transactions.filter((t) => t.source === "waste_report" && new Date(t.timestamp).toDateString() === today).length;
    const src = SUPPORTING_ECOPOINT_SOURCES.WASTE_REPORT;
    const reward = rewardedToday < REWARDED_REPORTS_PER_DAY ? src.amount : 0;

    const kecamatan = findKecamatan(form.kecamatanId);
    const report = addReport({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as WasteCategory,
      severity: form.severity as WasteSeverity,
      lat: form.lat,
      lng: form.lng,
      address: form.address.trim() || `${kecamatan?.name ?? "Surabaya"}, Surabaya`,
      kecamatanId: form.kecamatanId,
      photos: form.photos,
      reporterName: user?.name ?? "Warga Surabaya",
      reporterUserId: user ? String(user.id) : undefined,
      ecoPointsAwarded: reward,
    });
    if (reward) points.earn(reward, "waste_report", src.label, report.id);

    setSubmitted({ id: report.id, points: reward });
    toast.success(reward ? `Laporan berhasil dikirim · +${reward} EcoPoints` : "Laporan berhasil dikirim");
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#A8D5BA] bg-white p-6 text-center shadow-sm sm:p-8" role="status">
        <CheckCircle size={52} className="text-[#2D5F3F]" aria-hidden="true" />
        <div>
          <h3 className="text-xl font-extrabold text-[#1A1A1A]">Laporan Berhasil Dikirim</h3>
          <p className="mt-1 text-sm text-gray-500">Laporan Anda kini tercatat di sistem respon cepat dan masuk dalam Peta Dampak Lingkungan.</p>
        </div>
        <p className="w-full rounded-xl bg-[#F0FAF4] px-4 py-3 text-sm">
          ID Laporan: <span className="font-mono font-bold text-[#2D5F3F]">{submitted.id.toUpperCase()}</span>
        </p>
        <p className="text-sm font-semibold text-[#2D5F3F]">
          {submitted.points ? `+${submitted.points} EcoPoints atas partisipasi aktif Anda!` : "Batas harian EcoPoints untuk pelaporan telah tercapai. Terima kasih atas kepedulian Anda!"}
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => { setForm(INITIAL); setSubmitted(null); setStep(1); }} className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Kirim Laporan Lainnya
          </button>
          <button type="button" onClick={onDone} className="flex-1 rounded-xl bg-[#2D5F3F] py-2.5 text-sm font-bold text-white hover:bg-[#245033]">
            Lihat Peta Laporan
          </button>
        </div>
      </div>
    );
  }

  const input = "w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20";

  return (
    <div className="flex flex-col gap-5">
      <StepBar step={step} />

      {step === 1 && (
        <section className="flex flex-col gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="loc-heading">
          <div>
            <h3 id="loc-heading" className="text-sm font-bold text-[#1A1A1A]">Di mana lokasi timbulan sampah?</h3>
            <p className="text-xs text-gray-500">Klik langsung pada peta atau gunakan lokasi GPS perangkat. Laporkan fasilitas umum atau area terbuka.</p>
          </div>
          <WasteMapCanvas reports={[]} className="h-64" picked={form.lat !== null && form.lng !== null ? { lat: form.lat, lng: form.lng } : null} onPick={setPoint} />
          <button
            type="button"
            onClick={geolocate}
            disabled={geoLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#2D5F3F] py-2.5 text-sm font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4] disabled:opacity-60"
          >
            {geoLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}
            Gunakan Lokasi Saya Saat Ini
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wr-kecamatan" className="mb-1 block text-xs font-semibold text-gray-600">Kecamatan</label>
              <select
                id="wr-kecamatan"
                value={form.kecamatanId}
                onChange={(e) => {
                  const kId = e.target.value;
                  const k = findKecamatan(kId);
                  if (k && form.lat === null) {
                    patch({ kecamatanId: kId, lat: k.center[0], lng: k.center[1] });
                  } else {
                    patch({ kecamatanId: kId });
                  }
                }}
                className={input}
              >
                <option value="">Pilih kecamatan setelah menandai titik</option>
                {SURABAYA_KECAMATAN.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="wr-address" className="mb-1 block text-xs font-semibold text-gray-600">Patokan / Nama Jalan (Opsional)</label>
              <input id="wr-address" value={form.address} onChange={(e) => patch({ address: e.target.value.slice(0, 120) })} placeholder="misal: dekat jembatan penyeberangan" className={input} />
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)} disabled={!step1Valid} className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-500">
            Lanjut <ChevronRight size={16} aria-hidden="true" />
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
          <div>
            <label htmlFor="wr-title" className="mb-1 block text-xs font-semibold text-gray-600">Judul Laporan *</label>
            <input id="wr-title" value={form.title} onChange={(e) => patch({ title: e.target.value.slice(0, 100) })} placeholder="misal: Sampah liar menumpuk di saluran air" className={input} />
            <p className="mt-1 text-[11px] text-gray-400">{form.title.trim().length}/100 · minimal 10 karakter</p>
          </div>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-gray-600">Kategori Sampah *</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CATEGORIES.map(([key, cfg]) => (
                <button key={key} type="button" aria-pressed={form.category === key} onClick={() => patch({ category: key })}
                  className={cn("flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs", form.category === key ? "border-[#2D5F3F] bg-[#F0FAF4] ring-1 ring-[#2D5F3F]" : "border-[#E5E7EB] hover:border-[#A8D5BA]")}>
                  <WasteCategoryIcon category={key} size={18} className="shrink-0 text-[#2D5F3F]" />
                  <span><span className="block font-semibold text-[#1A1A1A]">{cfg.labelId}</span></span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-gray-600">Tingkat Keparahan *</legend>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map(([key, cfg]) => (
                <button key={key} type="button" aria-pressed={form.severity === key} onClick={() => patch({ severity: key })}
                  className={cn("flex flex-col items-center gap-1 rounded-xl border py-2 text-[11px] font-bold", form.severity === key ? "ring-2" : "border-[#E5E7EB] text-gray-700")}
                  style={form.severity === key ? { borderColor: cfg.color, backgroundColor: cfg.bg, color: cfg.color } : undefined}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} aria-hidden="true" />{cfg.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="wr-desc" className="mb-1 block text-xs font-semibold text-gray-600">Deskripsi Kondisi *</label>
            <textarea id="wr-desc" rows={4} value={form.description} onChange={(e) => patch({ description: e.target.value.slice(0, 500) })} placeholder="Jelaskan kondisi tumpukan sampah, perkiraan lama menumpuk, atau potensi bahaya…" className={cn(input, "resize-none")} />
            <p className="mt-1 text-[11px] text-gray-400">{form.description.trim().length}/500 · minimal 20 karakter</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-600"><ChevronLeft size={16} aria-hidden="true" /> Kembali</button>
            <button type="button" onClick={() => setStep(3)} disabled={!step2Valid} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-500">Lanjut <ChevronRight size={16} aria-hidden="true" /></button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A]">Foto Bukti Lapangan</h3>
            <p className="text-xs text-gray-500">Unggah 1–3 foto bukti. Foto dikompresi otomatis dan data GPS dibersihkan demi privasi.</p>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => addPhotos(e.target.files)} />
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => addPhotos(e.target.files)} />
          {form.photos.length < MAX_PHOTOS && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={photoBusy} onClick={() => cameraRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-semibold text-white disabled:opacity-60">
                <Camera size={16} aria-hidden="true" /> Ambil Foto
              </button>
              <button type="button" disabled={photoBusy} onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#2D5F3F] py-3 text-sm font-semibold text-[#2D5F3F] disabled:opacity-60">
                <ImagePlus size={16} aria-hidden="true" /> Pilih dari Galeri
              </button>
            </div>
          )}
          {photoBusy && <p className="text-xs text-gray-500" role="status">Memproses foto…</p>}
          {form.photos.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {form.photos.map((src, i) => (
                <li key={i} className="relative aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                  <img src={src} alt={`Foto laporan ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => patch({ photos: form.photos.filter((_, j) => j !== i) })} aria-label={`Hapus foto ${i + 1}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                    <X size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-xl bg-[#F9FAFB] p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700">Ringkasan Laporan</p>
            <p>Lokasi: {findKecamatan(form.kecamatanId)?.name}{form.address && ` · ${form.address}`}</p>
            {form.category && <p>{CATEGORY_CONFIG[form.category].labelId}{form.severity && ` · Tingkat ${SEVERITY_CONFIG[form.severity].label}`}</p>}
            <p className="italic">&ldquo;{form.title}&rdquo;</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-gray-600"><ChevronLeft size={16} aria-hidden="true" /> Kembali</button>
            <button type="button" onClick={submit} disabled={!step3Valid || submitting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-500">
              {submitting ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Mengirim…</> : "Kirim Laporan"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
