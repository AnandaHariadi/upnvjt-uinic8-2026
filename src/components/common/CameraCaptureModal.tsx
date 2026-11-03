"use client";

import { useEffect, useRef, useState } from "react";
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
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

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
              ? "Izin akses kamera ditolak. Silakan izinkan akses kamera di browser Anda atau gunakan 'Pilih dari Galeri'."
              : err.name === "NotFoundError" || err.name === "DevicesNotFoundError"
              ? "Tidak ada kamera yang terdeteksi di perangkat ini."
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
  }, [isOpen, facingMode]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md"
    >
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Camera size={16} />
            </div>
            <div>
              <h3 id="camera-modal-title" className="text-sm font-bold text-white">
                Ambil Bukti Aksi Langsung
              </h3>
              <p className="text-[11px] text-gray-400">Arahkan kamera ke sampah / bukti aksi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            aria-label="Tutup kamera"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-black sm:aspect-16/10">
          {cameraError ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-gray-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <AlertCircle size={24} />
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
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
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

              {/* Viewfinder Target Frame */}
              <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-dashed border-emerald-400/40">
                {/* Corners */}
                <div className="absolute -left-1 -top-1 h-4 w-4 border-l-3 border-t-3 border-emerald-400" />
                <div className="absolute -right-1 -top-1 h-4 w-4 border-r-3 border-t-3 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-3 border-l-3 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-3 border-r-3 border-emerald-400" />
              </div>

              {/* Shutter Flash Animation */}
              {flash && <div className="absolute inset-0 bg-white transition-opacity duration-150" />}
            </>
          )}
        </div>

        {/* Footer / Controls */}
        <div className="flex items-center justify-between bg-neutral-950 px-6 py-4">
          {/* Switch Camera Button (if multiple cameras available) */}
          <div className="w-12">
            {hasMultipleCameras && !cameraError && (
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Putar Kamera"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
              >
                <RefreshCw size={17} />
              </button>
            )}
          </div>

          {/* Shutter Button */}
          {!cameraError && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing || !stream}
              aria-label="Jepret Foto"
              className="group flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 p-1 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <div className="h-full w-full rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
            </button>
          )}

          {/* Close / Cancel */}
          <div className="flex w-12 justify-end">
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
