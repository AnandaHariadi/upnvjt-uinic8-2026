"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Gauge, Home, Lightbulb, Star, UserRound, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import DataBadge from "@/components/common/DataBadge";
import {
  analyzePowerUsage,
  type HouseholdProfile,
  type BenchmarkResult,
} from "@/utils/electricityBenchmark";

/* ─────────────── constants ─────────────── */
const DAYA_OPTIONS: { va: HouseholdProfile["daya"]; label: string; golongan: string }[] = [
  { va: 450,  label: "450 VA",   golongan: "R1/Subsidi" },
  { va: 900,  label: "900 VA",   golongan: "R1/Subsidi" },
  { va: 1300, label: "1.300 VA", golongan: "R1" },
  { va: 2200, label: "2.200 VA", golongan: "R1" },
  { va: 3500, label: "3.500 VA", golongan: "R2" },
  { va: 4400, label: "4.400 VA+",golongan: "R3" },
];

const HUNIAN_OPTIONS: { value: HouseholdProfile["type"]; label: string; sub: string }[] = [
  { value: "rumah_kecil",  label: "Small house",  sub: "< 36 m²" },
  { value: "rumah_sedang", label: "Medium house", sub: "36–100 m²" },
  { value: "rumah_besar",  label: "Large house",  sub: "> 100 m²" },
  { value: "apartment",   label: "Apartment",    sub: "Any unit" },
];

const SUMBER_OPTIONS = ["Manual entry", "From bill scan (OCR)", "From my PLN app"] as const;
type Sumber = typeof SUMBER_OPTIONS[number];

const LS_KEY = "pacul-household-profile";

/* ─────────────── helpers ─────────────── */
const fmtRp = (n: number) =>
  n ? "Rp " + n.toLocaleString("id-ID") : "";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function currentMonthYear() {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

/* ─────────────── sample history (demo data, illustrative) ─────────────── */
const MOCK_HISTORY = [
  { month: "Nov", usage: 220, avg: 260 },
  { month: "Dec", usage: 195, avg: 260 },
  { month: "Jan", usage: 240, avg: 260 },
  { month: "Feb", usage: 185, avg: 260 },
  { month: "Mar", usage: 210, avg: 260 },
  { month: "Apr", usage: 170, avg: 260 },
];

/* ─────────────── sub-components ─────────────── */

function MemberStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-lg font-bold text-gray-500 hover:border-[#2D5F3F] hover:text-[#2D5F3F] transition-colors"
        aria-label="Fewer household members"
      >
        −
      </button>
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ scale: i < value ? 1 : 0.7, opacity: i < value ? 1 : 0.25 }}
            className="text-white"
            aria-hidden
          >
            <UserRound size={18} />
          </motion.span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(6, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-lg font-bold text-gray-500 hover:border-[#2D5F3F] hover:text-[#2D5F3F] transition-colors"
        aria-label="More household members"
      >
        +
      </button>
      <span className="text-sm font-semibold text-[#1A1A1A]">{value} {value === 1 ? "person" : "people"}</span>
    </div>
  );
}

function ComparisonBar({ yourUsage, avgUsage, color }: { yourUsage: number; avgUsage: number; color: string }) {
  const max = Math.max(yourUsage, avgUsage) * 1.15;
  const youPct = (yourUsage / max) * 100;
  const avgPct = (avgUsage / max) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-white/80">You</span>
          <span className="font-bold text-white">{yourUsage} kWh</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${youPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-white/60">Reference</span>
          <span className="font-bold text-white/60">{avgUsage} kWh</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="h-full rounded-full bg-white/40"
          />
        </div>
      </div>
    </div>
  );
}

function BenchmarkCard({ result }: { result: BenchmarkResult }) {
  const isGood = result.status === "sangat_hemat" || result.status === "hemat";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-2xl text-white"
      style={{ background: result.statusBg }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
        <Gauge size={44} aria-hidden="true" />
        <p className="text-xl font-extrabold">{result.statusLabel}</p>
        <p className="text-sm text-white/70">{result.message}</p>
      </div>

      {/* Stats */}
      <div className="mx-4 mb-4 rounded-xl bg-black/20 px-4 py-3">
        <ComparisonBar
          yourUsage={result.yourUsage}
          avgUsage={result.averageUsage}
          color={result.statusColor}
        />
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-xs">
          <span className="text-white/60">Difference</span>
          <span className={`font-bold ${result.difference < 0 ? "text-[#7AC74F]" : "text-red-300"}`}>
            {result.difference > 0 ? "+" : ""}{result.difference} kWh
          </span>
        </div>
        <p className="mt-2 text-[10px] text-white/50">
          Reference values are illustrative prototype benchmarks, not official PLN statistics.
        </p>
      </div>

      {/* CO2 */}
      <div className="mx-4 mb-4 rounded-xl bg-black/20 px-4 py-3 text-sm">
        {isGood ? (
          <>
            <p className="font-semibold text-[#7AC74F]">
              Estimated {Math.abs(result.co2Impact)} kg CO₂ below the reference this month
            </p>
            <p className="mt-1 text-white/60">Estimate uses the grid emission factor; not a measurement.</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-red-300">
              Estimated +{result.co2Impact} kg CO₂ above the reference
            </p>
            <p className="mt-1 text-white/60">
              Saving 10% of the excess ≈ {(Math.abs(result.co2Impact) * 0.1).toFixed(1)} kg CO₂ less
            </p>
          </>
        )}
      </div>

      {/* EcoPoints */}
      {result.ecoPointsEarned > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mx-4 mb-4 flex items-center justify-center gap-3 rounded-xl bg-[#7AC74F]/20 border border-[#7AC74F]/40 px-4 py-3"
        >
          <Star size={24} className="text-[#7AC74F]" aria-hidden="true" />
          <div>
            <p className="text-lg font-extrabold text-[#7AC74F]">+{result.ecoPointsEarned} EcoPoints</p>
            <p className="text-xs text-white/60">Awarded once per billing month when you save the report.</p>
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <div className="mx-4 mb-5 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-white/50">Tips for you</p>
        {result.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl bg-black/20 px-3 py-2.5 text-sm">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-200" aria-hidden="true" />
            <span className="text-white/80">{tip}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────── Main Component ─────────────── */
export default function InputListrikManual() {
  const earn = useEcoPointsStore((s) => s.earn);
  const transactions = useEcoPointsStore((s) => s.transactions);

  /* Profil state */
  const [profileSaved, setProfileSaved] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [members, setMembers] = useState<HouseholdProfile["members"]>(3);
  const [daya, setDaya] = useState<HouseholdProfile["daya"]>(2200);
  const [hunian, setHunian] = useState<HouseholdProfile["type"]>("rumah_sedang");

  /* Input state */
  const [kwh, setKwh] = useState("");
  const [tagihan, setTagihan] = useState("");
  const [tagihanDisplay, setTagihanDisplay] = useState("");
  const [sumber, setSumber] = useState<Sumber>("Manual entry");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthYear().month);
  const [selectedYear, setSelectedYear] = useState(currentMonthYear().year);
  const [saving, setSaving] = useState(false);

  /* Benchmark result (debounced) */
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Load profile from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const p = JSON.parse(saved) as HouseholdProfile;
        setMembers(p.members);
        setDaya(p.daya);
        setHunian(p.type);
        setProfileSaved(true);
      }
    } catch { /* ignore */ }
  }, []);

  const saveProfile = () => {
    const profile: HouseholdProfile = { members, daya, type: hunian };
    if (typeof window !== "undefined")
      localStorage.setItem(LS_KEY, JSON.stringify(profile));
    setProfileSaved(true);
    setEditProfile(false);
    toast.success("Household profile saved");
  };

  /* Debounce benchmark calc */
  const recalc = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const n = parseFloat(val);
    if (!n || n <= 0) { setResult(null); return; }
    debounceRef.current = setTimeout(() => {
      setResult(analyzePowerUsage(n, { members, daya, type: hunian }));
    }, 500);
  }, [members, daya, hunian]);

  useEffect(() => { recalc(kwh); }, [kwh, recalc]);

  /* Tagihan auto-format */
  const handleTagihan = (raw: string) => {
    const num = raw.replace(/\D/g, "");
    setTagihan(num);
    setTagihanDisplay(num ? "Rp " + parseInt(num).toLocaleString("id-ID") : "");
  };

  const handleSubmit = async () => {
    const kwhNum = parseFloat(kwh);
    if (!kwhNum || kwhNum <= 0) { toast.error("Please enter your kWh usage first."); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    // One benchmark reward per billing period (fraud mitigation).
    const periodRef = `elec-${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    const alreadyRewarded = transactions.some((t) => t.source === "electricity_benchmark" && t.refId === periodRef);
    const reward = !alreadyRewarded && result?.ecoPointsEarned ? result.ecoPointsEarned : 0;
    if (reward) earn(reward, "electricity_benchmark", `Electricity below reference in ${monthNames[selectedMonth - 1]} ${selectedYear}`, periodRef);
    toast.success(
      reward
        ? `Report saved · +${reward} EcoPoints`
        : alreadyRewarded
          ? "Report saved (this period was already rewarded)"
          : "Electricity report saved"
    );
    setSaving(false);
  };

  const showProfileForm = !profileSaved || editProfile;

  /* ── Month/year selectors ── */
  const years = [2025, 2026];

  /* ── History chart custom dot ── */
  const HistoryDot = (props: { cx?: number; cy?: number; payload?: { usage: number; avg: number } }) => {
    const { cx = 0, cy = 0, payload } = props;
    const good = (payload?.usage ?? 0) <= (payload?.avg ?? 0);
    return <circle cx={cx} cy={cy} r={5} fill={good ? "#7AC74F" : "#EF4444"} stroke="none" />;
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── SECTION 1: Profil Rumah Tangga ── */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A]">Household profile</h3>
            <p className="text-xs text-gray-400">Used to pick a comparable reference value</p>
          </div>
          {profileSaved && !editProfile && (
            <button
              onClick={() => setEditProfile(true)}
              className="text-xs font-semibold text-[#2D5F3F] hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {showProfileForm ? (
          <div className="flex flex-col gap-5">
            {/* Members */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-600">
                Household members
              </label>
              <MemberStepper
                value={members}
                onChange={(v) => setMembers(v as HouseholdProfile["members"])}
              />
            </div>

            {/* Daya */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-600">
                Power class{" "}
                <span className="font-normal text-gray-400">(see your PLN bill)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DAYA_OPTIONS.map((opt) => (
                  <button
                    key={opt.va}
                    type="button"
                    onClick={() => setDaya(opt.va)}
                    className={`rounded-xl border px-2 py-2.5 text-center transition-all ${
                      daya === opt.va
                        ? "border-[#2D5F3F] bg-[#F0FAF4] ring-1 ring-[#2D5F3F]"
                        : "border-[#E5E7EB] hover:border-[#A8D5BA]"
                    }`}
                  >
                    <p className={`text-xs font-bold ${daya === opt.va ? "text-[#2D5F3F]" : "text-[#1A1A1A]"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[9px] text-gray-400">{opt.golongan}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Hunian */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-600">Home type</label>
              <div className="grid grid-cols-2 gap-2">
                {HUNIAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHunian(opt.value)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      hunian === opt.value
                        ? "border-[#2D5F3F] bg-[#F0FAF4] ring-1 ring-[#2D5F3F]"
                        : "border-[#E5E7EB] hover:border-[#A8D5BA]"
                    }`}
                  >
                    <Home size={18} className="shrink-0 text-[#2D5F3F]" aria-hidden="true" />
                    <div>
                      <p className={`text-xs font-semibold ${hunian === opt.value ? "text-[#2D5F3F]" : "text-[#1A1A1A]"}`}>
                        {opt.label}
                      </p>
                      <p className="text-[9px] text-gray-400">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveProfile}
              className="rounded-xl bg-[#2D5F3F] py-2.5 text-sm font-bold text-white hover:bg-[#245033] transition-colors"
            >
              Save profile
            </button>
          </div>
        ) : (
          /* Saved profile summary */
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3 text-sm">
            <Users size={16} className="text-[#2D5F3F]" aria-hidden="true" />
            <span className="font-semibold text-[#1A1A1A]">{members} {members === 1 ? "person" : "people"}</span>
            <span className="text-gray-300">·</span>
            <span className="font-semibold text-[#1A1A1A]">
              {DAYA_OPTIONS.find((d) => d.va === daya)?.label}
            </span>
            <span className="text-gray-300">·</span>
            <span className="font-semibold text-[#1A1A1A]">
              {HUNIAN_OPTIONS.find((h) => h.value === hunian)?.label}
            </span>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Input Bulanan ── */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-[#1A1A1A]">Monthly usage</h3>

        <div className="flex flex-col gap-4">
          {/* Month/year */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Billing period</label>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-28 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* kWh: BIG input */}
          <div>
            <label htmlFor="kwh-input" className="mb-1.5 block text-xs font-semibold text-gray-600">
              Electricity used
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-[#E5E7EB] focus-within:border-[#2D5F3F] focus-within:ring-2 focus-within:ring-[#2D5F3F]/20">
              <input
                id="kwh-input"
                type="number"
                min={0}
                step={1}
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent px-4 py-3 text-2xl font-extrabold text-[#1A1A1A] outline-none placeholder-gray-200"
              />
              <span className="pr-4 text-base font-semibold text-gray-400">kWh</span>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Tip: on a PLN bill this is &ldquo;Stand Kini minus Stand Lalu&rdquo;, the current meter reading minus the previous one.
            </p>
          </div>

          {/* Tagihan: optional */}
          <div>
            <label htmlFor="tagihan-input" className="mb-1.5 block text-xs font-semibold text-gray-600">
              Bill total <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="tagihan-input"
              type="text"
              inputMode="numeric"
              value={tagihanDisplay}
              onChange={(e) => handleTagihan(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Rp 0"
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
            />
          </div>

          {/* Sumber */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Data source</label>
            <div className="flex flex-col gap-2">
              {SUMBER_OPTIONS.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="sumber"
                    checked={sumber === s}
                    onChange={() => setSumber(s)}
                    className="accent-[#2D5F3F]"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Benchmark result (live) ── */}
      <AnimatePresence>
        {result && <BenchmarkCard result={result} />}
      </AnimatePresence>

      {/* ── Submit button ── */}
      {kwh && parseFloat(kwh) > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#2D5F3F] py-4 text-sm font-extrabold text-white shadow-md hover:bg-[#245033] disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F] focus-visible:ring-offset-2"
        >
          {saving ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Menyimpan…</>
          ) : (
            <>Simpan Laporan Listrik {monthNames[selectedMonth - 1]} {selectedYear}</>
          )}
        </motion.button>
      )}

      {/* ── SECTION 4: Riwayat 6 bulan ── */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F3D2E]">Tren 6 Bulan Terakhir</h3>
          <DataBadge variant="demo" label="Data Sampel" />
        </div>
        <p className="mb-4 text-[11px] text-gray-500">
          Titik hijau menandakan pemakaian efisien di bawah acuan, titik merah melampaui rata-rata.
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={MOCK_HISTORY} margin={{ top: 8, bottom: 0, left: -24, right: 8 }}>
            <XAxis
              dataKey="month"
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v} kWh`, name === "usage" ? "Pemakaian Anda" : "Batas Acuan"]}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="#2D5F3F"
              strokeWidth={2}
              name="usage"
              dot={(p) => <HistoryDot key={`u-${p.cx}`} {...p} />}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#D1D5DB"
              strokeWidth={2}
              strokeDasharray="4 2"
              name="avg"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#2D5F3F]" /> You</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#D1D5DB]" style={{ borderTop: "2px dashed #D1D5DB", background: "none" }} /> Illustrative reference</span>
        </div>
      </div>

    </div>
  );
}
