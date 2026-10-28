"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Dot,
} from "recharts";
import { useStepTracker } from "@/hooks/useStepTracker";
import Link from "next/link";
import { AlertTriangle, Flame, Leaf, Lock, MapPin, Monitor, Star } from "lucide-react";
import { useStepTrackerStore, type StepMilestone } from "@/store/stepTracker.store";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";
import PageWrapper from "@/components/common/PageWrapper";

/* ── helpers ── */
const DAILY_TARGET = 10_000;
const fmt2 = (n: number) => n.toFixed(2);

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.innerWidth > 1024 || typeof DeviceMotionEvent === "undefined";
}

/* ── Circular gauge ── */
const RADIUS = 90;
const CIRC = 2 * Math.PI * RADIUS;

function StepGauge({ steps, target }: { steps: number; target: number }) {
  const pct = Math.min(1, steps / target);
  const offset = CIRC * (1 - pct);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={220} height={220} className="-rotate-90">
        <circle
          cx={110} cy={110} r={RADIUS}
          fill="none" stroke="#E5E7EB" strokeWidth={14}
        />
        <motion.circle
          cx={110} cy={110} r={RADIUS}
          fill="none"
          stroke="#1D9E75"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[44px] sm:text-[50px] font-extrabold leading-none text-[#0F3D2E] tabular-nums">
          {steps.toLocaleString("id-ID")}
        </span>
        <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          LANGKAH SESI INI
        </span>
        <span className="mt-0.5 text-xs font-semibold text-[#1D9E75]">
          {Math.round(pct * 100)}% dari target {target.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}

/* ── Confetti ── */
const CONFETTI_COLORS = ["#1D9E75", "#2D5F3F", "#F59E0B", "#10B981", "#A8D5BA", "#7AC74F"];
function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-2.5 w-2.5 rounded-sm"
          style={{
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: `${(i * 2.5) % 100}%`,
            top: "-12px",
            opacity: 0,
            animation: `confettiFall ${1 + (i % 5) * 0.25}s ease-in ${(i % 10) * 0.1}s forwards`,
            transform: `rotate(${i * 13}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── 3D Medallion Badges for Step Stats ── */
function StatBadge3D({ type, size = 52 }: { type: "calories" | "distance" | "co2" | "points"; size?: number }) {
  if (type === "calories") {
    return (
      <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <defs>
          <radialGradient id="glow_cal" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>
          <linearGradient id="gold_rim_cal" x1="0" y1="0" x2="84" y2="84">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>
        <path d="M30 66L42 76L54 66H30Z" fill="#9A3412" />
        <path d="M26 64L42 78L58 64L52 62L42 70L32 62L26 64Z" fill="#F97316" />
        <circle cx="42" cy="38" r="28" fill="url(#gold_rim_cal)" />
        <circle cx="42" cy="38" r="23" fill="url(#glow_cal)" />
        <ellipse cx="42" cy="24" rx="12" ry="5.5" fill="white" fillOpacity="0.38" />
        <path d="M42 22C42 22 47 28 47 34C47 39 44 42 42 42C40 42 37 39 37 34C37 30 39 27 42 22Z" fill="#FEF08A" />
        <path d="M42 27C44 30 46 34 46 37C46 41 43.5 44 41 44C38.5 44 36 41.5 36 38C36 33 40 30 42 27Z" fill="#FDE047" opacity="0.85" />
        <path d="M42 36C43 38 43.5 40 43.5 41C43.5 43 42.5 44 41.5 44C40.5 44 39.5 43 39.5 41C39.5 39 41 38 42 36Z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === "distance") {
    return (
      <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <defs>
          <radialGradient id="glow_dist" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </radialGradient>
          <linearGradient id="gold_rim_dist" x1="0" y1="0" x2="84" y2="84">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>
        <path d="M30 66L42 76L54 66H30Z" fill="#0369A1" />
        <path d="M26 64L42 78L58 64L52 62L42 70L32 62L26 64Z" fill="#38BDF8" />
        <circle cx="42" cy="38" r="28" fill="url(#gold_rim_dist)" />
        <circle cx="42" cy="38" r="23" fill="url(#glow_dist)" />
        <ellipse cx="42" cy="24" rx="12" ry="5.5" fill="white" fillOpacity="0.38" />
        <g transform="translate(42, 38)">
          <path d="M0 -13C-6 -13 -10 -9 -10 -3C-10 4.5 0 13 0 13C0 13 10 4.5 10 -3C10 -9 6 -13 0 -13Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
          <circle cx="0" cy="-4" r="3.5" fill="#0284C7" />
          <circle cx="0" cy="-4" r="1.5" fill="#FFFFFF" />
        </g>
      </svg>
    );
  }

  if (type === "co2") {
    return (
      <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <defs>
          <radialGradient id="glow_co2" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="55%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>
          <linearGradient id="gold_rim_co2" x1="0" y1="0" x2="84" y2="84">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>
        <path d="M30 66L42 76L54 66H30Z" fill="#064E3B" />
        <path d="M26 64L42 78L58 64L52 62L42 70L32 62L26 64Z" fill="#10B981" />
        <circle cx="42" cy="38" r="28" fill="url(#gold_rim_co2)" />
        <circle cx="42" cy="38" r="23" fill="url(#glow_co2)" />
        <ellipse cx="42" cy="24" rx="12" ry="5.5" fill="white" fillOpacity="0.38" />
        <path d="M47 23C36 23 30 33 32 45C38 47 49 45 53 35C54 29 53 24 47 23Z" fill="#FEF08A" />
        <path d="M33 44C38 38 44 31 48 25" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // points
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" aria-hidden="true">
      <defs>
        <radialGradient id="glow_pts" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <linearGradient id="gold_rim_pts" x1="0" y1="0" x2="84" y2="84">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="35%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <path d="M30 66L42 76L54 66H30Z" fill="#78350F" />
      <path d="M26 64L42 78L58 64L52 62L42 70L32 62L26 64Z" fill="#FBBF24" />
      <circle cx="42" cy="38" r="28" fill="url(#gold_rim_pts)" />
      <circle cx="42" cy="38" r="23" fill="url(#glow_pts)" />
      <ellipse cx="42" cy="24" rx="12" ry="5.5" fill="white" fillOpacity="0.38" />
      <path d="M42 21L45.5 30.5L55 31L47.5 37.5L50 47L42 41.5L34 47L36.5 37.5L29 31L38.5 30.5L42 21Z" fill="#FFFFFF" filter="drop-shadow(0 2px 4px rgba(180,83,9,0.5))" />
      <circle cx="42" cy="34" r="2.5" fill="#F59E0B" />
    </svg>
  );
}

/* ── Main ── */
export default function StepTrackerClient() {
  const tracker = useStepTracker();
  const store = useStepTrackerStore();
  const earn = useEcoPointsStore((s) => s.earn);

  const [desktop, setDesktop] = useState(false);
  const [needsHttps, setNeedsHttps] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  /* Detect desktop + HTTPS requirement on mount */
  useEffect(() => {
    setDesktop(isDesktop());
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isHttps = location.protocol === "https:";
    if (isIOS && !isHttps) setNeedsHttps(true);
  }, []);

  /* Sync steps to store */
  const prevStepsRef = useRef(0);
  useEffect(() => {
    const diff = tracker.steps - prevStepsRef.current;
    if (diff > 0) store.addSteps(diff);
    prevStepsRef.current = tracker.steps;
  }, [tracker.steps]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Sync tracking status to store */
  useEffect(() => {
    store.setIsTracking(tracker.isTracking);
  }, [tracker.isTracking]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Milestone detection: rewarded once per day, and only for real sensor steps. */
  const MILESTONES: { key: StepMilestone; target: number; source: keyof typeof SUPPORTING_ECOPOINT_SOURCES }[] = [
    { key: "m1000", target: 1000, source: "STEP_1000" },
    { key: "m5000", target: 5000, source: "STEP_5000" },
    { key: "m10000", target: 10000, source: "STEP_10000" },
  ];
  useEffect(() => {
    if (tracker.isSimulated) return;
    for (const m of MILESTONES) {
      if (tracker.steps >= m.target && store.markMilestone(m.key)) {
        const src = SUPPORTING_ECOPOINT_SOURCES[m.source];
        earn(src.amount, "step_milestone", src.label);
        toast.success(`${src.label} · +${src.amount} EcoPoints`);
        triggerConfetti();
      }
    }
  }, [tracker.steps]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2800);
  };

  /* Live steps-per-minute (10s window) */
  const stepLog = useRef<{ t: number; s: number }[]>([]);
  useEffect(() => {
    const now = Date.now();
    stepLog.current.push({ t: now, s: tracker.steps });
    stepLog.current = stepLog.current.filter((e) => now - e.t < 10_000);
  }, [tracker.steps]);

  const stepsPerMin = (() => {
    const log = stepLog.current;
    if (log.length < 2) return 0;
    const span = (log[log.length - 1].t - log[0].t) / 1000;
    const diff = log[log.length - 1].s - log[0].s;
    return span > 0 ? Math.round((diff / span) * 60) : 0;
  })();

  const doneToday = store.milestoneDay === new Date().toDateString() ? store.milestones : { m1000: false, m5000: false, m10000: false };
  const missions = [
    { label: "1.000 Langkah Pertama", target: 1000, points: SUPPORTING_ECOPOINT_SOURCES.STEP_1000.amount, done: doneToday.m1000 },
    { label: "5.000 Langkah", target: 5000, points: SUPPORTING_ECOPOINT_SOURCES.STEP_5000.amount, done: doneToday.m5000 },
    { label: "Target 10.000 Langkah Hari Ini", target: 10000, points: SUPPORTING_ECOPOINT_SOURCES.STEP_10000.amount, done: doneToday.m10000, mega: true },
  ];

  /* Hourly bar data: only show 6am-10pm */
  const hourlyVisible = store.hourlyData.filter((h) => h.hour >= 6 && h.hour <= 22);

  return (
    <PageWrapper>
      {showConfetti && <Confetti />}

      <div className="flex flex-col gap-5 lg:gap-6">
        {/* ── Header ── */}
        <header>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#1D9E75] border border-emerald-200">
              Portal Warga
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D5F3F]">
              Langkah Hijau
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">
            Pelacak Langkah Kaki
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-600 leading-relaxed">
            Setiap langkah kaki menggantikan emisi kendaraan bermotor di Surabaya. Pantau langkah Anda di sini, atau verifikasi perjalanan sepeda,
            jalan kaki, dan transportasi umum di menu{" "}
            <Link href="/dashboard/eco-action" className="font-bold text-[#1D9E75] underline">
              Aksi Hijau
            </Link>{" "}
            untuk menambah EcoPoints.
          </p>
        </header>

        {/* ── Desktop notice ── */}
        {desktop && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
            <Monitor size={18} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              Anda sedang mengakses melalui perangkat <strong>desktop</strong>. Pelacak langkah berjalan dalam{" "}
              <strong>mode simulasi</strong> untuk demonstrasi sistem.
            </p>
          </div>
        )}

        {/* ── HTTPS required (iOS) ── */}
        {needsHttps && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-orange-900">Sensor gerak memerlukan koneksi aman HTTPS</p>
              <p className="mt-0.5 text-xs text-orange-700">
                iOS Safari membatasi sensor gerak pada koneksi HTTP. Buka aplikasi menggunakan <strong>https://</strong> atau gunakan mode simulasi.
              </p>
              <button
                onClick={() => tracker.startSimulation()}
                className="mt-2 rounded-lg bg-orange-100 border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-200 transition-colors"
              >
                Gunakan mode simulasi
              </button>
            </div>
          </div>
        )}

        {/* ── Permission denied ── */}
        {tracker.hasPermission === false && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-900">
              <AlertTriangle size={16} className="text-red-600" aria-hidden="true" /> Akses sensor gerak ditolak
            </p>
            <p className="mt-1 text-xs text-red-700">
              Untuk menghitung langkah aktual, izinkan akses sensor gerak pada pengaturan browser Anda.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => tracker.startSimulation()}
                className="rounded-lg bg-red-100 border border-red-300 px-4 py-2 text-xs font-semibold text-red-900 hover:bg-red-200 transition-colors"
              >
                Gunakan mode simulasi
              </button>
            </div>
          </div>
        )}

        {tracker.isSimulated && tracker.isTracking && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800" role="status">
            LANGKAH SIMULASI (Mode demonstrasi peramban desktop)
          </p>
        )}

        {/* ── SECTION 1: Gauge & Utama ── */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
          {/* Pulse ring when tracking */}
          {tracker.isTracking && (
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#1D9E75]/30"
              style={{
                width: 240,
                height: 240,
                animation: "pulseRing 2s ease-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          <div className="flex flex-col items-center gap-6">
            <StepGauge steps={tracker.steps} target={DAILY_TARGET} />

            {/* 4 mini stats dengan Lencana 3D Berwarna */}
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { type: "calories" as const, label: "Kalori Terbakar", value: `${tracker.calories} kkal`, sub: "Aktivitas Fisik" },
                { type: "distance" as const, label: "Jarak Tempuh", value: `${fmt2(tracker.distance / 1000)} km`, sub: "Estimasi GPS/Sensor" },
                { type: "co2" as const, label: "Cegah CO₂e", value: `${tracker.co2Saved} kg`, sub: "vs Sepeda Motor" },
                { type: "points" as const, label: "EcoPoints Sesi", value: `+${missions.filter((m) => m.done).reduce((s, m) => s + m.points, 0)}`, sub: "Reward Tercapai" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A6246] to-[#0D3628] p-4 text-center text-white shadow-md border border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400/60"
                >
                  {/* Subtle top glow highlight */}
                  <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-xl transition-opacity group-hover:bg-emerald-400/30" />

                  {/* 3D Lencana Icon */}
                  <div className="relative mb-2 transition-transform duration-300 group-hover:scale-110">
                    <StatBadge3D type={stat.type} size={54} />
                  </div>

                  <div className="text-lg sm:text-xl font-black tracking-tight text-white tabular-nums">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-200">
                    {stat.label}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium text-emerald-100/60">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Main CTA button */}
            <div className="relative">
              {tracker.isTracking && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ animation: "ctaPulse 1.5s ease-out infinite", backgroundColor: "#1D9E75", opacity: 0.3 }}
                />
              )}
              {!tracker.isTracking ? (
                <button
                  onClick={() => desktop ? tracker.startSimulation() : tracker.startTracking()}
                  className="relative rounded-full bg-[#1D9E75] hover:bg-[#178563] px-10 py-3.5 text-base font-bold text-white shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1D9E75]/30"
                >
                  Mulai Melangkah
                </button>
              ) : (
                <button
                  onClick={() => tracker.stopTracking()}
                  className="relative rounded-full px-10 py-3.5 text-base font-bold text-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 bg-red-600 hover:bg-red-700"
                >
                  Hentikan Sesi
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Session info ── */}
        <AnimatePresence>
          {tracker.isTracking && tracker.startTime && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-5 py-3"
            >
              <div className="text-xs sm:text-sm">
                <span className="text-gray-500">Mulai: </span>
                <span className="font-semibold text-[#0F3D2E]">
                  {tracker.startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="text-gray-500">Durasi: </span>
                <span className="font-bold text-[#1D9E75]">{formatDuration(tracker.duration)}</span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="text-gray-500">Kecepatan: </span>
                <span className="font-semibold text-[#0F3D2E]">{stepsPerMin} langkah/mnt</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 3: Hourly bar chart ── */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-600">
            Aktivitas Langkah Hari Ini per Jam
          </h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={hourlyVisible} margin={{ top: 0, bottom: 0, left: -20, right: 0 }}>
              <XAxis
                dataKey="hour"
                tickFormatter={(v) => `${v}`}
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, color: "#1A1A1A", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)" }}
                labelFormatter={(v) => `Pukul ${v}:00`}
                formatter={(v: number) => [`${v.toLocaleString("id-ID")} langkah`, ""]}
                cursor={{ fill: "rgba(29, 158, 117, 0.08)" }}
              />
              <Bar dataKey="steps" fill="#1D9E75" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── SECTION 4: Missions ── */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-600">
            Target Langkah Harian
          </h2>
          <div className="flex flex-col gap-3">
            {missions.map((m) => {
              const pct = Math.min(100, Math.round((tracker.steps / m.target) * 100));
              return (
                <div
                  key={m.label}
                  className={`rounded-xl p-4 transition-colors ${
                    m.done
                      ? "bg-emerald-50/70 border border-emerald-200"
                      : "bg-[#F9FAFB] border border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">{m.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        m.done
                          ? "bg-[#1D9E75] text-white"
                          : "bg-gray-100 border border-gray-200 text-gray-600"
                      }`}
                    >
                      {m.done ? "SELESAI" : `+${m.points} EcoPoints`}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.done ? "#1D9E75" : m.mega ? "#F59E0B" : "#10B981" }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                    <span>{tracker.steps.toLocaleString("id-ID")} langkah</span>
                    <span>{m.target.toLocaleString("id-ID")} langkah</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 5: Weekly summary ── */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Tren 7 Hari Terakhir
            </h2>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              DATA SIMULASI
            </span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={store.weeklyData} margin={{ top: 8, bottom: 0, left: -20, right: 8 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, color: "#1A1A1A", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`${v.toLocaleString("id-ID")} langkah`, ""]}
                cursor={{ stroke: "rgba(0,0,0,0.08)" }}
              />
              <Line
                type="linear"
                dataKey="steps"
                stroke="#1D9E75"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const achieved = (payload as { steps: number }).steps >= DAILY_TARGET;
                  return (
                    <Dot
                      key={`dot-${cx}-${cy}`}
                      cx={cx} cy={cy}
                      r={achieved ? 5 : 3}
                      fill={achieved ? "#1D9E75" : "#EF4444"}
                      stroke="none"
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-[10px] text-gray-500">
            Titik hijau: target tercapai (10.000 langkah). Titik merah: di bawah target harian.
          </p>
        </div>

        {/* Reset button */}
        {tracker.steps > 0 && !tracker.isTracking && (
          <div className="flex justify-center pb-4">
            <button
              onClick={tracker.reset}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Reset Sesi Langkah
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        @keyframes ctaPulse {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </PageWrapper>
  );
}
