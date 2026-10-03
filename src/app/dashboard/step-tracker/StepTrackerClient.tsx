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
          fill="none" stroke="#2a3d2f" strokeWidth={14}
        />
        <motion.circle
          cx={110} cy={110} r={RADIUS}
          fill="none"
          stroke="#7AC74F"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[52px] font-extrabold leading-none text-white tabular-nums">
          {steps.toLocaleString("id-ID")}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
          LANGKAH SESI INI
        </span>
        <span className="mt-0.5 text-xs text-[#7AC74F]">
          {Math.round(pct * 100)}% dari target {target.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}

/* ── Confetti ── */
const CONFETTI_COLORS = ["#7AC74F", "#2D5F3F", "#F59E0B", "#10B981", "#A8D5BA", "#ffffff"];
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
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#1a2e1f", color: "#ffffff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {showConfetti && <Confetti />}

      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7AC74F]">Langkah Hijau</p>
          <h1 className="text-2xl font-extrabold text-white">Pelacak Langkah Kaki</h1>
          <p className="mt-0.5 text-sm text-white/60">
            Setiap langkah kaki menggantikan emisi kendaraan bermotor di Surabaya. Pantau langkah Anda di sini, atau verifikasi perjalanan sepeda,
            jalan kaki, dan transportasi umum di menu{" "}
            <Link href="/dashboard/eco-action" className="font-semibold text-[#7AC74F] underline">Aksi Hijau</Link> untuk menambah EcoPoints.
          </p>
        </div>

        {/* ── Desktop notice ── */}
        {desktop && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3">
            <Monitor size={18} className="mt-0.5 shrink-0 text-yellow-200" aria-hidden="true" />
            <p className="text-sm text-yellow-200">
              Anda sedang mengakses melalui perangkat <strong>desktop</strong>. Pelacak langkah berjalan dalam{" "}
              <strong>mode simulasi</strong> untuk demonstrasi sistem.
            </p>
          </div>
        )}

        {/* ── HTTPS required (iOS) ── */}
        {needsHttps && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-orange-200" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-orange-200">Sensor gerak memerlukan koneksi aman HTTPS</p>
              <p className="mt-0.5 text-xs text-orange-200/70">
                iOS Safari membatasi sensor gerak pada koneksi HTTP. Buka aplikasi menggunakan <strong>https://</strong> atau gunakan mode simulasi.
              </p>
              <button
                onClick={() => tracker.startSimulation()}
                className="mt-2 rounded-lg bg-orange-500/30 px-3 py-1.5 text-xs font-semibold text-orange-100 hover:bg-orange-500/50 transition-colors"
              >
                Gunakan mode simulasi
              </button>
            </div>
          </div>
        )}

        {/* ── Permission denied ── */}
        {tracker.hasPermission === false && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-900/30 px-4 py-4">
            <p className="flex items-center gap-1.5 font-semibold text-red-300"><AlertTriangle size={16} aria-hidden="true" /> Akses sensor gerak ditolak</p>
            <p className="mt-1 text-sm text-red-200/70">
              Untuk menghitung langkah aktual, izinkan akses sensor gerak pada pengaturan browser Anda.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => tracker.startSimulation()}
                className="rounded-lg bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/50 transition-colors"
              >
                Gunakan mode simulasi
              </button>
            </div>
          </div>
        )}

        {tracker.isSimulated && tracker.isTracking && (
          <p className="mb-4 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-100" role="status">
            LANGKAH SIMULASI (Mode demonstrasi peramban desktop)
          </p>
        )}

        {/* ── SECTION 1: Gauge ── */}
        <div
          className="relative mb-6 overflow-hidden rounded-2xl p-6"
          style={{ background: "linear-gradient(135deg, #223b27 0%, #1a2e1f 100%)" }}
        >
          {/* Pulse ring when tracking */}
          {tracker.isTracking && (
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7AC74F]/30"
              style={{
                width: 240, height: 240,
                animation: "pulseRing 2s ease-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          <div className="flex flex-col items-center gap-6">
            <StepGauge steps={tracker.steps} target={DAILY_TARGET} />

            {/* 4 mini stats */}
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { Icon: Flame, label: "Kalori (Perkiraan)", value: `${tracker.calories} kkal` },
                { Icon: MapPin, label: "Jarak (Estimasi)", value: `${fmt2(tracker.distance / 1000)} km` },
                { Icon: Leaf, label: "Cegah CO₂e vs Motor", value: `${tracker.co2Saved} kg` },
                { Icon: Star, label: "EcoPoints Hari Ini", value: `+${missions.filter((m) => m.done).reduce((s, m) => s + m.points, 0)}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <stat.Icon size={20} className="mx-auto text-[#7AC74F]" aria-hidden="true" />
                  <div className="mt-1 text-sm font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Main CTA button */}
            <div className="relative">
              {tracker.isTracking && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ animation: "ctaPulse 1.5s ease-out infinite", backgroundColor: "#7AC74F", opacity: 0.3 }}
                />
              )}
              {!tracker.isTracking ? (
                <button
                  onClick={() => desktop ? tracker.startSimulation() : tracker.startTracking()}
                  className="relative rounded-full bg-[#7AC74F] px-10 py-4 text-lg font-extrabold text-[#1a2e1f] shadow-lg hover:bg-[#6ab344] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7AC74F]/40"
                >
                  Mulai Melangkah
                </button>
              ) : (
                <button
                  onClick={() => tracker.stopTracking()}
                  className="relative rounded-full px-10 py-4 text-lg font-extrabold text-white shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/40"
                  style={{ backgroundColor: "rgba(239,68,68,0.8)" }}
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
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3"
            >
              <div className="text-sm">
                <span className="text-white/60">Mulai: </span>
                <span className="font-semibold text-white">
                  {tracker.startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-white/60">Durasi: </span>
                <span className="font-semibold text-[#7AC74F]">{formatDuration(tracker.duration)}</span>
              </div>
              <div className="text-sm">
                <span className="text-white/60">Kecepatan: </span>
                <span className="font-semibold text-white">{stepsPerMin} langkah/mnt</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 3: Hourly bar chart ── */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
            Aktivitas Langkah Hari Ini per Jam
          </h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={hourlyVisible} margin={{ top: 0, bottom: 0, left: -20, right: 0 }}>
              <XAxis
                dataKey="hour"
                tickFormatter={(v) => `${v}`}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1a2e1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(v) => `Pukul ${v}:00`}
                formatter={(v: number) => [`${v.toLocaleString("id-ID")} langkah`, ""]}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="steps" fill="#7AC74F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── SECTION 4: Missions ── */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
            Target Langkah Harian
          </h2>
          <div className="flex flex-col gap-3">
            {missions.map((m) => {
              const pct = Math.min(100, Math.round((tracker.steps / m.target) * 100));
              return (
                <div key={m.label} className={`rounded-xl p-4 transition-colors ${m.done ? "bg-[#7AC74F]/15 border border-[#7AC74F]/30" : "bg-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{m.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.done ? "bg-[#7AC74F] text-black" : "bg-white/10 text-white/50"}`}>
                      {m.done ? "SELESAI" : `+${m.points} EcoPoints`}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.done ? "#7AC74F" : m.mega ? "#F59E0B" : "#4ade80" }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-white/60">
                    <span>{tracker.steps.toLocaleString("id-ID")}</span>
                    <span>{m.target.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 5: Weekly summary ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
            Tren 7 Hari Terakhir <span className="ml-1 rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] text-amber-100">DATA SIMULASI</span>
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={store.weeklyData} margin={{ top: 8, bottom: 0, left: -20, right: 8 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1a2e1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v.toLocaleString("id-ID")} langkah`, ""]}
                cursor={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Line
                type="monotone"
                dataKey="steps"
                stroke="#7AC74F"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const achieved = (payload as { steps: number }).steps >= DAILY_TARGET;
                  return (
                    <Dot
                      key={`dot-${cx}-${cy}`}
                      cx={cx} cy={cy}
                      r={achieved ? 5 : 3}
                      fill={achieved ? "#7AC74F" : "#ef4444"}
                      stroke="none"
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-[10px] text-white/60">
            Titik hijau: target tercapai. Titik merah: di bawah target harian.
          </p>
        </div>

        {/* Reset button */}
        {tracker.steps > 0 && !tracker.isTracking && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={tracker.reset}
              className="text-sm text-white/60 hover:text-white/80 transition-colors"
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
    </div>
  );
}
