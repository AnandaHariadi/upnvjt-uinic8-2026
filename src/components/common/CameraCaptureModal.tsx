"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, RefreshCw, AlertCircle, ImagePlus } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onFallbackToGallery?: () => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  onFallbackToGallery,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  // Stop all camera tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let active = true;
    setCameraError(null);

    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Perangkat atau browser Anda tidak mendukung akses kamera langsung.");
        }

        // Check for multiple cameras
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === "videoinput");
          if (active) setHasMultipleCameras(videoDevices.length > 1);
        } catch {
          // Ignore enumerate error
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!active) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg =
          err instanceof Error
            ? err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
              ? "Izin akses kamera belum diizinkan. Silakan aktifkan izin kamera di browser Anda atau pilih foto dari galeri."
              : err.name === "NotFoundError" || err.name === "DevicesNotFoundError"
              ? "Tidak ada kamera yang terdeteksi di perangkat Anda."
              : err.message
            : "Gagal menghubungkan kamera.";
        setCameraError(msg);
      }
    };

    initCamera();

    return () => {
      active = false;
      stopStream();
    };
  }, [isOpen, facingMode, stopStream]);

  // Capture snapshot from video
  const handleCapture = () => {
    if (!videoRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      const video = videoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Gagal mengolah gambar");

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsCapturing(false);
            return;
          }

          const file = new File([blob], `evidence_${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          stopStream();
          onCapture(file);
          onClose();
          setIsCapturing(false);
        },
        "image/jpeg",
        0.92
      );
    } catch {
      setIsCapturing(false);
    }
  };

  // Switch between front & back camera
  const toggleFacingMode = () => {
    stopStream();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
    >
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bersih Selaras Tema BONI */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#2D5F3F] border border-emerald-200 shadow-xs">
              <Camera size={19} />
            </div>
            <div>
              <h3 id="camera-modal-title" className="text-sm font-bold text-[#1A1A1A]">
                Ambil Bukti Aksi Hijau
              </h3>
              <p className="text-xs text-gray-500">Posisikan sampah atau bukti aksi di layar kamera</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            aria-label="Tutup kamera"
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Area (Bersih Tanpa Garis Titik-Titik) */}
        <div className="p-4 sm:p-5 bg-[#F9FAFB]">
          <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-2xl bg-black shadow-inner sm:aspect-16/11">
            {cameraError ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center text-gray-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <AlertCircle size={26} />
                </div>
                <p className="max-w-sm text-xs leading-relaxed text-gray-300">{cameraError}</p>
                {onFallbackToGallery && (
                  <button
                    type="button"
                    onClick={() => {
                      stopStream();
                      onClose();
                      onFallbackToGallery();
                    }}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#2D5F3F] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#245033] transition-colors shadow-sm"
                  >
                    <ImagePlus size={15} />
                    <span>Pilih dari Galeri / File</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />

                {/* Shutter Flash Animation */}
                {flash && <div className="absolute inset-0 bg-white transition-opacity duration-150" />}
              </>
            )}
          </div>
        </div>

        {/* Footer / Kontrol Jepret Sesuai Desain BONI */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
          {/* Tombol Putar Kamera */}
          <div className="w-16">
            {hasMultipleCameras && !cameraError && (
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Putar Kamera"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-[#F0FAF4] hover:text-[#2D5F3F] transition-all shadow-xs active:scale-95"
              >
                <RefreshCw size={18} />
              </button>
            )}
          </div>

          {/* Tombol Shutter Utama (Emerald Hijau BONI) */}
          {!cameraError && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing || !stream}
              aria-label="Jepret Foto"
              className="group flex h-18 w-18 items-center justify-center rounded-full border-4 border-emerald-100 bg-white p-1 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md ring-2 ring-emerald-500/20"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2D5F3F] group-hover:bg-[#245033] shadow-inner text-white transition-colors">
                <Camera size={26} className="text-white drop-shadow-xs" />
              </div>
            </button>
          )}

          {/* Tombol Batal */}
          <div className="flex w-16 justify-end">
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
