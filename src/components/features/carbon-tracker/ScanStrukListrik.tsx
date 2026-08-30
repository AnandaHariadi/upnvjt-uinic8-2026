"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Scan, CheckCircle, AlertTriangle, RefreshCw, X, ZoomIn, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import DataBadge from "@/components/common/DataBadge";

/* ── Types ── */
type ScanState = "idle" | "uploading" | "processing" | "success" | "partial" | "error";

interface ScanResult {
  kwh?: number;
  tagihan?: number;
  noPelanggan?: string;
  namaPelanggan?: string;
  bulanTagihan?: string;
  dayaVA?: string;
  /** Share of expected bill fields that were found (0–100). Not an OCR accuracy metric. */
  confidence: number;
  rawText?: string;
  mode: "live" | "demo";
}

/* ── OCR API call ── */
async function callOcrApi(file: File, onProgress: (p: number) => void): Promise<ScanResult> {
  const formData = new FormData();
  formData.append("image", file);

  /* Simulate upload progress */
  onProgress(20);
  await new Promise((r) => setTimeout(r, 400));
  onProgress(60);

  try {
    const res = await fetch("/api/ocr/scan-bill", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
    onProgress(100);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Could not reach the OCR service");
    }
    const json = (await res.json()) as {
      success: boolean;
      data?: {
        no_pelanggan?: string;
        nama_pelanggan?: string;
        bulan_tagihan?: string;
        daya_va?: string;
        penggunaan_kwh?: string;
        tagihan_rp?: string;
      };
      kwh?: number;
      tagihan?: number;
      confidence?: number;
      raw_text?: string;
      mode?: "live" | "demo";
    };

    if (!json.success) throw new Error("The bill could not be read");

    return {
      kwh: json.kwh,
      tagihan: json.tagihan,
      noPelanggan: json.data?.no_pelanggan,
      namaPelanggan: json.data?.nama_pelanggan,
      bulanTagihan: json.data?.bulan_tagihan,
      dayaVA: json.data?.daya_va,
      confidence: json.confidence ?? 0,
      rawText: json.raw_text,
      mode: json.mode === "live" ? "live" : "demo",
    };
  } catch (err) {
    onProgress(100);
    const msg = err instanceof Error ? err.message : "Could not reach the OCR service";
    throw new Error(msg);
  }
}

/* ── Processing steps animation ── */
const PROC_STEPS = [
  "Image received",
  "Sending to Google Cloud Vision OCR…",
  "Extracting bill text…",
];

function ProcessingView() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = PROC_STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 1100)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Scan size={44} className="text-[#2D5F3F]" />
      </motion.div>
      <div className="flex flex-col gap-2 text-sm">
        {PROC_STEPS.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={step > i ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -8 }}
            className="flex items-center gap-2"
          >
            {step > i ? (
              <CheckCircle size={14} className="text-[#2D5F3F] shrink-0" />
            ) : (
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-300" />
            )}
            <span className={step > i ? "text-[#1A1A1A] font-medium" : "text-gray-400"}>
              {s}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Usually takes 3–5 seconds</p>
    </div>
  );
}

/* ── Result row ── */
function ResultRow({ label, value, highlight }: { label: string; value?: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col rounded-lg px-3 py-2.5 ${highlight ? "bg-[#E8F5E9] border border-[#A8D5BA]" : "bg-[#F9FAFB]"}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className={`mt-0.5 text-sm font-bold ${highlight ? "text-[#2D5F3F]" : "text-[#1A1A1A]"}`}>
        {value ?? <span className="text-gray-300">-</span>}
      </span>
    </div>
  );
}

/* ── Camera Modal ── */
function CameraModal({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError("Camera is not available. Please upload a file instead.");
      }
    })();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setCapturedBlob(blob);
      setPreview(canvas.toDataURL("image/jpeg", 0.9));
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }, "image/jpeg", 0.9);
  };

  const confirm = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `struk-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
    onClose();
  };

  const retake = async () => {
    setPreview(null);
    setCapturedBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Could not restart the camera.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#111] shadow-2xl"
        role="dialog" aria-modal="true" aria-label="Camera for capturing the electricity bill"
      >
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80"
        >
          <X size={16} />
        </button>

        {error ? (
          <div className="flex flex-col items-center gap-3 p-8 text-white">
            <AlertTriangle size={32} className="text-yellow-400" />
            <p className="text-center text-sm">{error}</p>
            <button onClick={onClose} className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
              Tutup
            </button>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Captured electricity bill" className="w-full rounded-xl object-cover" />
            <div className="flex w-full gap-3">
              <button
                onClick={retake}
                className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={confirm}
                className="flex-1 rounded-xl bg-[#7AC74F] py-2.5 text-sm font-bold text-black hover:bg-[#6ab344] transition-colors"
              >
                Use photo
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-4 p-4">
            <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
              {/* Crop guide overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-3/4 w-5/6 rounded-lg border-2 border-dashed border-white/50" />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] text-white/70">
                Fit the bill inside the frame
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={capture}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 active:scale-95 transition-transform"
              aria-label="Capture photo"
            >
              <Camera size={24} className="text-[#2D5F3F]" />
            </button>
            <p className="text-xs text-white/40">Press the button to capture</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function ScanStrukListrik() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editKwh, setEditKwh] = useState("");
  const [editTagihan, setEditTagihan] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      toast.error("Unsupported file type. Please use JPG, PNG or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maximum file size is 10 MB.");
      return;
    }

    setScanState("uploading");
    setUploadProgress(0);

    try {
      setScanState("processing");
      const res = await callOcrApi(file, setUploadProgress);

      setResult(res);
      setEditKwh(res.kwh?.toString() ?? "");
      setEditTagihan(res.tagihan?.toString() ?? "");

      if (res.confidence >= 60) {
        setScanState("success");
        toast.success(`Bill read. ${res.confidence}% of the expected fields were found`);
      } else {
        setScanState("partial");
        toast("Some fields could not be read. Please complete them manually.", { icon: <AlertTriangle size={16} aria-hidden="true" /> });
      }
    } catch (err) {
      setScanState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong while processing the image.");
    }
  }, []);

  const handleSave = () => {
    const kwh = parseFloat(editKwh) || result?.kwh;
    const tagihan = parseInt(editTagihan) || result?.tagihan;
    const points = useEcoPointsStore.getState();
    const today = new Date().toDateString();
    const alreadyToday = points.transactions.some((t) => t.source === "bill_scan" && new Date(t.timestamp).toDateString() === today);
    const src = SUPPORTING_ECOPOINT_SOURCES.BILL_SCAN;
    if (!alreadyToday) points.earn(src.amount, "bill_scan", src.label);
    toast.success(`Electricity data saved: ${kwh ?? "-"} kWh${tagihan ? ` · Rp ${tagihan.toLocaleString("id-ID")}` : ""}${alreadyToday ? "" : ` · +${src.amount} EcoPoints`}`);
    setScanState("idle");
    setResult(null);
  };

  const reset = () => {
    setScanState("idle");
    setResult(null);
    setErrorMsg("");
    setEditMode(false);
    setUploadProgress(0);
  };

  const rp = (n?: number) =>
    n != null ? `Rp ${n.toLocaleString("id-ID")}` : undefined;

  return (
    <>
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Camera size={18} className="text-[#2D5F3F]" />
          <h3 className="text-base font-semibold text-[#1A1A1A]">Electricity Bill OCR</h3>
          <span className="ml-auto rounded-full bg-[#2D5F3F]/10 px-2 py-0.5 text-[10px] font-bold text-[#2D5F3F]">
            Google Cloud Vision OCR
          </span>
        </div>

        <AnimatePresence mode="wait">

          {/* ── IDLE ── */}
          {scanState === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label
                className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#A8D5BA] px-6 py-10 text-center transition-colors hover:border-[#2D5F3F] hover:bg-[#F0FAF4]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
              >
                <Camera size={48} className="text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-600">Upload or photograph your PLN electricity bill</p>
                  <p className="mt-0.5 text-xs text-gray-400">JPG, PNG or WebP · max 10 MB · text extraction only</p>
                </div>
              </label>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#2D5F3F] py-2.5 text-sm font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4] transition-colors"
                >
                  <Camera size={15} /> Take photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2D5F3F] py-2.5 text-sm font-semibold text-white hover:bg-[#245033] transition-colors"
                >
                  <Upload size={15} /> Upload file
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-2.5">
                <Lightbulb size={15} className="mt-0.5 shrink-0 text-yellow-700" aria-hidden="true" />
                <p className="text-xs text-yellow-700">
                  <strong>Tip:</strong> Make sure the photo is sharp and the bill text is fully visible. Good lighting improves text extraction.
                </p>
              </div>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </motion.div>
          )}

          {/* ── UPLOADING ── */}
          {scanState === "uploading" && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <Upload size={36} className="text-[#2D5F3F] animate-bounce" />
              <p className="font-semibold text-gray-700">Uploading photo…</p>
              <div className="w-full rounded-full bg-gray-100 h-2.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#7AC74F]"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-400">{uploadProgress}%</p>
            </motion.div>
          )}

          {/* ── PROCESSING ── */}
          {scanState === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingView />
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {(scanState === "success" || scanState === "partial") && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 ${scanState === "success" ? "bg-[#E8F5E9] border border-[#A8D5BA]" : "bg-yellow-50 border border-yellow-200"}`}>
                <div className="flex items-center gap-2">
                  {scanState === "success"
                    ? <CheckCircle size={18} className="text-[#2D5F3F]" />
                    : <AlertTriangle size={18} className="text-yellow-600" />
                  }
                  <span className="font-semibold text-sm">
                    {scanState === "success" ? "Bill read successfully" : "Some fields could not be read"}
                  </span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${result.confidence >= 80 ? "bg-[#2D5F3F] text-white" : "bg-yellow-200 text-yellow-800"}`}>
                  {result.confidence}% fields found
                </span>
              </div>
              {result.mode === "demo" && (
                <p className="mb-4 flex items-center gap-2 text-xs text-amber-800">
                  <DataBadge variant="simulated" label="Demo result" />
                  Google Vision is not configured, so sample bill data is shown.
                </p>
              )}

              {/* kWh highlight */}
              <div className="mb-4 rounded-xl bg-[#E3F2FD] border border-[#90CAF9] px-4 py-3">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">This month&apos;s usage</p>
                {editMode ? (
                  <input
                    type="number"
                    value={editKwh}
                    onChange={(e) => setEditKwh(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-blue-300 px-3 py-1.5 text-2xl font-extrabold text-blue-800 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                ) : (
                  <p className="mt-0.5 text-2xl font-extrabold text-blue-800">
                    {result.kwh ?? "-"} <span className="text-base font-normal">kWh</span>
                  </p>
                )}
              </div>

              {/* Grid of fields */}
              <div className="mb-4 grid grid-cols-2 gap-2">
                <ResultRow label="Customer no." value={result.noPelanggan} />
                <ResultRow label="Name" value={result.namaPelanggan} />
                <ResultRow label="Period" value={result.bulanTagihan} />
                <ResultRow label="Power" value={result.dayaVA} />
                <ResultRow label="Usage" value={result.kwh ? `${result.kwh} kWh` : undefined} highlight />
                <ResultRow label="Bill total" value={rp(result.tagihan)} />
              </div>

              {/* Partial: editable fields for missing data */}
              {scanState === "partial" && (
                <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-200 p-3">
                  <p className="mb-2 text-xs font-semibold text-yellow-700">Complete the missing fields:</p>
                  <div className="flex flex-col gap-2">
                    {!result.kwh && (
                      <div>
                        <label htmlFor="edit-kwh" className="block text-xs font-medium text-gray-600 mb-1">Usage (kWh)</label>
                        <input id="edit-kwh" type="number" value={editKwh} onChange={(e) => setEditKwh(e.target.value)}
                          placeholder="Enter kWh" className="w-full rounded-lg border border-yellow-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300" />
                      </div>
                    )}
                    {!result.tagihan && (
                      <div>
                        <label htmlFor="edit-tagihan" className="block text-xs font-medium text-gray-600 mb-1">Bill total (Rp)</label>
                        <input id="edit-tagihan" type="number" value={editTagihan} onChange={(e) => setEditTagihan(e.target.value)}
                          placeholder="Enter bill amount" className="w-full rounded-lg border border-yellow-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-bold text-white hover:bg-[#245033] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
                >
                  <CheckCircle size={15} /> Save electricity data
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode((v) => !v)}
                    className="flex-1 rounded-xl border border-[#2D5F3F] py-2.5 text-sm font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4] transition-colors"
                  >
                    Edit manually
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={13} /> Scan again
                  </button>
                </div>
              </div>

              {/* Raw text toggle */}
              {result.rawText && (
                <details className="mt-3">
                  <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
                    <ZoomIn size={11} /> Show raw OCR text
                  </summary>
                  <pre className="mt-2 max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3 text-[10px] text-gray-500 whitespace-pre-wrap">
                    {result.rawText}
                  </pre>
                </details>
              )}
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {scanState === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-xl bg-red-50 border border-red-200 p-6"
            >
              <AlertTriangle size={36} className="text-red-500" />
              <div className="text-center">
                <p className="font-semibold text-red-700">Could not read the bill</p>
                <p className="mt-1 text-sm text-red-500">{errorMsg}</p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors"
              >
                <RefreshCw size={13} /> Try again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraModal
            onCapture={(file) => { setShowCamera(false); handleFile(file); }}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
