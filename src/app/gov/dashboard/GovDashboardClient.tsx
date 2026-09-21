"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  AlertTriangle, BarChart3, CheckCircle2, Clock, Download, Leaf, LogOut, Map as MapIcon,
  ShieldCheck, Store, Users, X, ClipboardList, ExternalLink, Menu, ChevronLeft, ChevronRight,
  ArrowRight, CheckCircle, ShieldAlert, Zap, Compass, Filter, PieChart as PieChartIcon, LayoutGrid, Sparkles
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie
} from "recharts";
import { useGovAuthStore } from "@/store/govAuth.store";
import {
  CATEGORY_CONFIG, RESPONSE_UNITS, SEVERITY_CONFIG, STATUS_CONFIG, averageResolutionHours, useWasteReportStore,
  type WasteReport, type WasteStatus,
} from "@/store/wasteReport.store";
import { useJudgeGuideStore } from "@/store/judgeGuide.store";
import { useVoucherStore } from "@/store/voucher.store";
import { useCollaborationStore } from "@/store/collaboration.store";
import { GREEN_ACTIONS, GREEN_ACTION_TYPES } from "@/config/green-actions";
import { findKecamatan, type SurabayaRegion } from "@/config/surabaya";
import { DEMO_MERCHANTS } from "@/data/demo/umkm-rewards";
import { METRIC_META, cityTotals, useDistrictStats, type DistrictMetric, type DistrictStats } from "@/lib/impact-aggregation";
import DistrictTable from "@/components/features/local-impact-map/DistrictTable";
import { MapLoading } from "@/components/maps/MapLoading";
import DataBadge from "@/components/common/DataBadge";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/utils/cn";
import { WasteCategoryIcon, GreenActionIcon } from "@/components/common/icons";
import GovSidebar, { type GovSection } from "@/components/layout/GovSidebar";

const ImpactMapCanvas = dynamic(
  () => import("@/components/features/local-impact-map/ImpactMapCanvas"),
  { ssr: false, loading: () => <MapLoading className="h-[420px]" /> }
);
const WasteMapCanvas = dynamic(
  () => import("@/components/features/waste-report/WasteMapCanvas"),
  { ssr: false, loading: () => <MapLoading className="h-[420px]" /> }
);

const REGIONS: SurabayaRegion[] = ["Pusat", "Utara", "Timur", "Selatan", "Barat"];

const SECTION_INFO: Record<GovSection, { title: string; desc: string }> = {
  overview: {
    title: "Pusat Kendali Lingkungan Kota Surabaya",
    desc: "Sistem pemantauan terpadu respon cepat penanganan sampah lingkungan, audit validasi aksi hijau warga, dan pemetaan intelijen 31 kecamatan.",
  },
  reports: {
    title: "Manajemen Tiket Laporan Sampah Warga",
    desc: "Pemantauan dan disposisi regu kebersihan untuk menindaklanjuti laporan titik sampah publik dari warga Surabaya.",
  },
  actions: {
    title: "Analisis Aksi Hijau Terverifikasi AI",
    desc: "Evaluasi data capaian aksi keberlanjutan warga Surabaya berdasarkan audit kecerdasan buatan Google Cloud Vision.",
  },
  spatial: {
    title: "Peta Intelijen Spasial Kota Surabaya",
    desc: "Visualisasi geospasial sebaran laporan kebersihan dan agregasi dampak lingkungan 31 kecamatan Surabaya.",
  },
  community: {
    title: "Partisipasi Komunitas Lingkungan",
    desc: "Pantauan keterlibatan warga, interaksi publik, dan kolaborasi aksi hijau di tingkat RT/RW dan kecamatan.",
  },
  economy: {
    title: "Sirkulasi Ekonomi & EcoPoints UMKM",
    desc: "Monitoring perputaran voucher dan dampak insentif EcoPoints pada pedagang UMKM lokal Surabaya.",
  },
};

const lightTooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 12,
  color: "#1A1A1A",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

const lightAxisTick = { fill: "#64748B", fontSize: 11 };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

function Panel({
  title,
  children,
  badge,
  className,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <h2 className="text-sm font-bold text-[#0F3D2E]">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  sub,
  Icon,
  accent,
  alert,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: typeof BarChart3;
  accent: string;
  alert?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "flex gap-3.5 rounded-2xl border p-4 shadow-xs transition-all sm:p-5",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5F3F]",
        alert
          ? "border-red-200 bg-red-50/70"
          : "border-gray-200/90 bg-white hover:border-[#1D9E75]/40"
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}18` }}
      >
        <Icon size={20} style={{ color: accent }} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-gray-500">{label}</span>
        <span
          className={cn(
            "block truncate text-xl font-extrabold sm:text-2xl mt-0.5 tracking-tight",
            alert ? "text-red-700" : "text-[#0F3D2E]"
          )}
        >
          {value}
        </span>
        {sub && <span className="block text-[11px] font-medium text-gray-500 mt-0.5 truncate">{sub}</span>}
      </span>
    </div>
  );
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─────────── Modal Kelola Laporan Sampah (Clean Light Theme) ─────────── */
function ReportManager({
  report,
  officer,
  onClose,
}: {
  report: WasteReport;
  officer: string;
  onClose: () => void;
}) {
  const updateStatus = useWasteReportStore((s) => s.updateStatus);
  const [status, setStatus] = useState<WasteStatus>(
    report.status === "reported" ? "in_progress" : report.status
  );
  const [unit, setUnit] = useState(report.assignedTo ?? "");
  const [note, setNote] = useState("");
  const needsNote = status === "resolved" || status === "rejected";

  const save = () => {
    updateStatus(report.id, {
      status,
      assignedTo: unit || undefined,
      note: note.trim() || undefined,
      by: officer,
    });
    toast.success(`Status penanganan tiket berhasil diperbarui ke: ${STATUS_CONFIG[status].label}`);
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-gray-200 bg-white text-gray-800 shadow-2xl focus:outline-none"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
            <div>
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    color: STATUS_CONFIG[report.status].color,
                    backgroundColor: STATUS_CONFIG[report.status].bg,
                  }}
                >
                  {STATUS_CONFIG[report.status].label}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    color: SEVERITY_CONFIG[report.severity].color,
                    backgroundColor: SEVERITY_CONFIG[report.severity].bg,
                  }}
                >
                  Tingkat Urgensi: {SEVERITY_CONFIG[report.severity].label}
                </span>
                {report.isDemo && <DataBadge variant="demo" />}
              </div>
              <Dialog.Title className="text-base font-bold text-gray-900">{report.title}</Dialog.Title>
            </div>
            <Dialog.Close
              aria-label="Tutup"
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-4 p-5 text-sm">
            {report.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.photos[0]}
                alt="Foto bukti titik laporan"
                className="h-48 w-full rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-400">
                <WasteCategoryIcon category={report.category} size={44} />
              </div>
            )}

            <dl className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["Nama Pelapor", report.reporterName],
                ["Waktu Pelaporan", fmtDate(report.createdAt)],
                ["Kategori Sampah", CATEGORY_CONFIG[report.category].label],
                ["Kecamatan", findKecamatan(report.kecamatanId)?.name ?? "-"],
                ["Dukungan Warga", `${report.upvotes} suara`],
                ["EcoPoints Terbit", `${report.ecoPointsAwarded} poin`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2">
                  <dt className="text-[10px] text-gray-500 font-medium">{k}</dt>
                  <dd className="font-semibold text-gray-800 mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>

            <a
              href={`https://www.openstreetmap.org/?mlat=${report.lat}&mlon=${report.lng}#map=18/${report.lat}/${report.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-xs font-semibold text-blue-900 transition hover:bg-blue-100/70"
            >
              <span>Buka Koordinat di Peta Geospasial ({report.lat.toFixed(5)}, {report.lng.toFixed(5)})</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>

            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Keterangan Lapangan dari Warga
              </p>
              <p className="text-xs leading-relaxed text-gray-700">{report.description}</p>
            </div>

            <fieldset className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <legend className="text-sm font-bold text-gray-900">Perbarui Status Tindak Lanjut</legend>

              <div className="grid grid-cols-3 gap-2">
                {(["in_progress", "resolved", "rejected"] as WasteStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={status === s}
                    onClick={() => setStatus(s)}
                    className={cn(
                      "rounded-xl py-2 text-xs font-bold transition shadow-2xs",
                      status === s
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    style={status === s ? { backgroundColor: STATUS_CONFIG[s].color } : undefined}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="gov-unit" className="block text-xs font-semibold text-gray-700 mb-1">
                  Disposisi ke Satuan Regu Lapangan
                </label>
                <select
                  id="gov-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#2D5F3F] focus:outline-none"
                >
                  <option value="">Pilih satuan tugas DLH Surabaya...</option>
                  {RESPONSE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gov-note" className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan Tindakan Lapangan {needsNote && <span className="text-red-500 font-bold">*wajib</span>}
                </label>
                <textarea
                  id="gov-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 300))}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#2D5F3F] focus:outline-none"
                  placeholder="Tuliskan tindakan pembersihan atau penertiban yang telah dilakukan di lapangan..."
                />
              </div>

              <button
                type="button"
                onClick={save}
                disabled={needsNote && !note.trim()}
                className="mt-1 rounded-xl bg-[#2D5F3F] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#245033] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Simpan & Catat Tindakan Resmi
              </button>
            </fieldset>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─────────── Bagian Laporan Sampah (Pagination 10) ─────────── */
function ReportsSection({
  reports,
  onManage,
}: {
  reports: WasteReport[];
  onManage: (r: WasteReport) => void;
}) {
  const [status, setStatus] = useState<WasteStatus | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = reports.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (!q ||
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        (findKecamatan(r.kecamatanId)?.name ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    downloadCsv(`pacul-laporan-sampah-${new Date().toISOString().slice(0, 10)}.csv`, [
      [
        "ID",
        "Judul Laporan",
        "Kategori",
        "Urgensi",
        "Status",
        "Kecamatan",
        "Latitude",
        "Longitude",
        "Tanggal Lapor",
        "Tanggal Selesai",
        "Petugas Regu",
      ],
      ...filtered.map((r) => [
        r.id,
        r.title,
        r.category,
        r.severity,
        r.status,
        findKecamatan(r.kecamatanId)?.name ?? "",
        r.lat,
        r.lng,
        r.createdAt,
        r.resolvedAt ?? "",
        r.assignedTo ?? "",
      ]),
    ]);
    toast.success(`${filtered.length} tiket laporan sampah berhasil diekspor ke CSV.`);
  };

  return (
    <Panel
      title="Manajemen Tiket Laporan Sampah Lingkungan Warga"
      badge={<DataBadge variant="demo" label="31 Kecamatan Surabaya" />}
    >
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <label className="sr-only" htmlFor="gov-search">
          Cari tiket laporan
        </label>
        <input
          id="gov-search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Cari judul laporan atau nama kecamatan..."
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-[#2D5F3F] focus:outline-none"
        />

        <label className="sr-only" htmlFor="gov-status">
          Filter status penanganan
        </label>
        <select
          id="gov-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#2D5F3F] focus:outline-none"
        >
          <option value="all">Semua Status Tiket</option>
          {(Object.keys(STATUS_CONFIG) as WasteStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition"
        >
          <Download size={13} aria-hidden="true" /> Ekspor CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[720px] text-left text-xs text-gray-700">
          <caption className="sr-only">Daftar laporan sampah warga</caption>
          <thead className="bg-gray-50/90 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-100">
            <tr>
              {["Judul Tiket", "Kategori", "Tingkat Urgensi", "Status", "Waktu Lapor", "Satuan Regu", "Tindakan"].map(
                (h) => (
                  <th key={h} scope="col" className="py-3 px-3.5">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="max-w-[220px] py-3 px-3.5">
                  <p className="truncate font-semibold text-gray-900">{r.title}</p>
                  <p className="text-[11px] text-gray-500">{findKecamatan(r.kecamatanId)?.name}</p>
                </td>
                <td className="py-3 px-3.5 font-medium">{CATEGORY_CONFIG[r.category].label}</td>
                <td className="py-3 px-3.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: SEVERITY_CONFIG[r.severity].color,
                      backgroundColor: SEVERITY_CONFIG[r.severity].bg,
                    }}
                  >
                    {SEVERITY_CONFIG[r.severity].label}
                  </span>
                </td>
                <td className="py-3 px-3.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: STATUS_CONFIG[r.status].color,
                      backgroundColor: STATUS_CONFIG[r.status].bg,
                    }}
                  >
                    {STATUS_CONFIG[r.status].label}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 px-3.5 text-gray-500">{fmtDate(r.createdAt)}</td>
                <td className="max-w-[160px] truncate py-3 px-3.5 text-gray-600">{r.assignedTo ?? "Belum Disposisi"}</td>
                <td className="py-3 px-3.5">
                  <button
                    type="button"
                    onClick={() => onManage(r)}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#0F3D2E] hover:bg-emerald-100 transition shadow-2xs"
                  >
                    Tindak Lanjuti
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Tidak ada tiket laporan yang sesuai dengan kriteria filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span>
            Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length} tiket
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Sebelumnya
            </button>
            <span className="px-2 font-bold text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Selanjutnya <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function byRegion(stats: DistrictStats[], pick: (d: DistrictStats) => number) {
  return REGIONS.map((region) => ({
    name: `Surabaya ${region}`,
    value: stats.filter((d) => d.kecamatan.region === region).reduce((s, d) => s + pick(d), 0),
  }));
}

/* ─────────── Komponen Utama Dasbor Pemerintah ─────────── */
export default function GovDashboardClient() {
  const router = useRouter();
  const hydrated = useHydrated();
  const govUser = useGovAuthStore((s) => s.user);
  const logout = useGovAuthStore((s) => s.logout);
  const reports = useWasteReportStore((s) => s.reports);
  const vouchers = useVoucherStore((s) => s.userVouchers);
  const posts = useCollaborationStore((s) => s.posts);
  const markVisited = useJudgeGuideStore((s) => s.markVisited);
  const stats = useDistrictStats();
  const totals = cityTotals(stats);

  const [section, setSection] = useState<GovSection>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [managing, setManaging] = useState<WasteReport | null>(null);
  const [metric, setMetric] = useState<DistrictMetric>("wasteReports");
  const [spatialLayer, setSpatialLayer] = useState<"districts" | "reports">("districts");
  const [actionVisualMode, setActionVisualMode] = useState<"donut" | "impact">("donut");

  useEffect(() => {
    if (!hydrated) return;
    if (!govUser) {
      logout();
      router.replace("/gov/login");
    } else {
      markVisited("gov");
    }
  }, [hydrated, govUser, logout, router, markVisited]);

  const openReports = reports.filter((r) => r.status === "reported" || r.status === "in_progress");
  const criticalOpen = openReports.filter((r) => r.severity === "critical").length;
  const avgHours = averageResolutionHours(reports);

  // Label Bahasa Indonesia penuh & detail metrik untuk visualisasi
  const actionDetails = useMemo(
    () =>
      GREEN_ACTION_TYPES.map((t) => {
        const def = GREEN_ACTIONS[t];
        const val = totals.actionsByType[t] || 0;
        const pct = Math.round((val / Math.max(1, totals.verifiedActions)) * 100);
        return {
          type: t,
          name: def.labelId || def.label,
          value: val,
          fill: def.color,
          pct,
          impactMetric: def.impactMetric,
          points: def.ecoPoints * val,
        };
      }),
    [totals]
  );

  const actionsByType = useMemo(
    () =>
      actionDetails.map((d) => ({
        name: d.name,
        value: d.value,
        fill: d.fill,
      })),
    [actionDetails]
  );


  const handleLogout = () => {
    logout();
    router.push("/gov/login");
    toast.success("Berhasil keluar dari sesi akun dinas.");
  };

  const exportDistricts = () => {
    downloadCsv(`pacul-rekap-31-kecamatan-${new Date().toISOString().slice(0, 10)}.csv`, [
      [
        "Kecamatan",
        "Wilayah",
        "Aksi Terverifikasi",
        "Estimasi CO2e (kg)",
        "Kontributor Aktif",
        "Total Laporan Sampah",
        "Laporan Belum Selesai",
        "EcoPoints Terbit",
        "EcoPoints Ditukarkan",
        "Mitra UMKM",
      ],
      ...stats.map((d) => [
        d.kecamatan.name,
        d.kecamatan.region,
        d.verifiedActions,
        d.estimatedCo2eKg,
        d.activeContributors,
        d.wasteReports,
        d.openWasteReports,
        d.ecoPointsIssued,
        d.ecoPointsRedeemed,
        d.umkmPartners,
      ]),
    ]);
    toast.success("Data rekapitulasi 31 kecamatan Surabaya berhasil diunduh.");
  };

  const hotspots = [...stats]
    .sort(
      (a, b) =>
        b.openWasteReports * 3 +
        b.criticalOpenReports * 5 -
        (a.openWasteReports * 3 + a.criticalOpenReports * 5)
    )
    .filter((d) => d.openWasteReports > 0)
    .slice(0, 5);

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const officerNameClean =
    !govUser?.name || govUser.name.includes("Demo") ? "Ir. Hendro Gunawan, M.Si" : govUser.name;
  const officerUnitClean = "Dinas Lingkungan Hidup Kota Surabaya";

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-[#1A1A1A]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-[#2D5F3F] focus:shadow-lg"
      >
        Langsung ke konten utama
      </a>

      {/* Gov Sidebar Sisi Kiri (Desktop Sticky, Mobile Drawer) */}
      <GovSidebar
        activeSection={section}
        onSelectSection={setSection}
        openReportsCount={openReports.length}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
        officerName={officerNameClean}
        officerUnit={officerUnitClean}
        officerRole="Pengawas Kebersihan Wilayah"
      />

      {/* Area Konten Sisi Kanan */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header Bar (Tanpa tombol warga) */}
        <header className="flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 lg:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <Image src="/logo.png" alt="PACUL" width={100} height={32} className="ml-3 h-7 w-auto object-contain" />
            <span className="ml-2 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
              Pemkot Surabaya
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar akun"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Konten Utama */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" role="main">
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Header Instansi Resmi Pemkot Surabaya */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#0F3D2E]">
                    Pemerintah Kota Surabaya
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    <span>Dinas Lingkungan Hidup · Bidang Pengendalian Kebersihan</span>
                  </span>
                </div>

                <span className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-1.5 text-xs font-semibold text-gray-600">
                  {todayStr}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] tracking-tight">
                    {SECTION_INFO[section].title}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-[#4D6D5B] leading-relaxed max-w-2xl">
                    {SECTION_INFO[section].desc}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={exportDistricts}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition active:scale-[0.98]"
                  >
                    <Download size={15} />
                    <span>Unduh Rekapitulasi CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Konten Halaman Sesuai Section */}
            {section === "overview" && (
              <>
                {/* Banner Operasional Wilayah Kerja */}
                <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 sm:flex-row sm:items-center sm:justify-between shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Status Operasional Wilayah:</strong> Seluruh sensor partisipasi warga dari 31 kecamatan Surabaya terhubung aktif. Verifikasi citra otomatis didukung AI Google Cloud Vision.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-900 bg-white border border-emerald-200 px-3 py-1 rounded-xl shrink-0 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    31 Kecamatan Terhubung
                  </span>
                </div>

                {/* 4 Kartu KPI Utama (Ringkas, Khusus Ringkasan Dasbor) */}
                <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                  <KpiCard
                    onClick={() => setSection("actions")}
                    label="Total Aksi Hijau"
                    value={`${totals.verifiedActions.toLocaleString("id-ID")} Aksi`}
                    sub="Terverifikasi AI se-Surabaya"
                    Icon={Leaf}
                    accent="#1D9E75"
                  />
                  <KpiCard
                    onClick={() => setSection("reports")}
                    label="Laporan Sampah Masuk"
                    value={`${reports.length} Laporan`}
                    sub={`${openReports.length} perlu tindakan · ${reports.filter((r) => r.status === "resolved").length} selesai`}
                    Icon={ClipboardList}
                    accent="#D97706"
                  />
                  <KpiCard
                    onClick={() => setSection("spatial")}
                    label="Estimasi Reduksi Emisi"
                    value={`${totals.estimatedCo2eKg.toLocaleString("id-ID")} kg`}
                    sub="Reduksi jejak karbon CO₂e"
                    Icon={Leaf}
                    accent="#0891B2"
                  />
                  <KpiCard
                    onClick={() => setSection("community")}
                    label="Warga Kontributor Aktif"
                    value={`${totals.activeContributors.toLocaleString("id-ID")} Warga`}
                    sub="Tersebar di 31 kecamatan"
                    Icon={Users}
                    accent="#7C3AED"
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-[60fr_40fr]">
                {/* Kolom Kiri: Tindakan Cepat Laporan Terbuka & Grafik Sebaran Aksi */}
                <div className="flex flex-col gap-6">
                  {/* Panel Tiket Sampah Perlu Disposisi Cepat */}
                  <Panel
                    title="Tiket Laporan Sampah Terbuka (Perlu Tindak Lanjut)"
                    badge={
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                        {openReports.length} Tiket Menunggu
                      </span>
                    }
                  >
                    {openReports.length === 0 ? (
                      <p className="py-6 text-center text-xs text-gray-500">
                        Seluruh laporan sampah lingkungan telah berhasil ditangani oleh tim regu.
                      </p>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-100">
                        {openReports.slice(0, 4).map((r) => (
                          <div
                            key={r.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                <WasteCategoryIcon category={r.category} size={20} />
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-bold text-gray-900 text-xs sm:text-sm">
                                    {r.title}
                                  </p>
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0"
                                    style={{
                                      color: SEVERITY_CONFIG[r.severity].color,
                                      backgroundColor: SEVERITY_CONFIG[r.severity].bg,
                                    }}
                                  >
                                    {SEVERITY_CONFIG[r.severity].label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Kecamatan {findKecamatan(r.kecamatanId)?.name} · Pelapor: {r.reporterName}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setManaging(r)}
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#0F3D2E] hover:bg-emerald-100 transition shadow-2xs"
                            >
                              Tindak Lanjuti
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        Total {openReports.length} laporan butuh penanganan regu lapangan
                      </span>
                      <button
                        type="button"
                        onClick={() => setSection("reports")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1D9E75] hover:underline"
                      >
                        Kelola Semua Laporan ({reports.length}) <ArrowRight size={13} />
                      </button>
                    </div>
                  </Panel>

                  {/* Visualisasi Modern: Sebaran Aksi Hijau (Donat & Kartu Dampak) */}
                  <Panel
                    title="Sebaran Aksi Hijau Berdasarkan Kategori"
                    badge={
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-gray-100 p-0.5" role="group" aria-label="Pilihan Visualisasi">
                          <button
                            type="button"
                            onClick={() => setActionVisualMode("donut")}
                            className={cn(
                              "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                              actionVisualMode === "donut"
                                ? "bg-white text-[#0F3D2E] shadow-2xs"
                                : "text-gray-500 hover:text-gray-900"
                            )}
                          >
                            <PieChartIcon size={12} />
                            <span>Donat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionVisualMode("impact")}
                            className={cn(
                              "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                              actionVisualMode === "impact"
                                ? "bg-white text-[#0F3D2E] shadow-2xs"
                                : "text-gray-500 hover:text-gray-900"
                            )}
                          >
                            <LayoutGrid size={12} />
                            <span>Dampak</span>
                          </button>
                        </div>
                        <DataBadge variant="demo" label="Audit AI" />
                      </div>
                    }
                  >
                    {actionVisualMode === "donut" ? (
                      <div className="grid grid-cols-1 md:grid-cols-[44fr_56fr] gap-4 items-center">
                        {/* Gauge Donat Interaktif dengan Metrik Tengah */}
                        <div className="relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                              <Tooltip contentStyle={lightTooltipStyle} />
                              <Pie
                                data={actionDetails}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={64}
                                outerRadius={92}
                                paddingAngle={4}
                                cornerRadius={6}
                                stroke="none"
                              >
                                {actionDetails.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Label Teks di Tengah Cincin Donat */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-[#0F3D2E] tracking-tight">
                              {totals.verifiedActions.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Aksi Terverifikasi
                            </span>
                            <span className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                              100% Validasi AI
                            </span>
                          </div>
                        </div>

                        {/* Rincian Kategori dengan Progres Bar Halus */}
                        <div className="flex flex-col gap-1.5">
                          {actionDetails.map((item) => (
                            <div
                              key={item.type}
                              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-2 transition hover:bg-emerald-50/40 hover:border-emerald-200"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: `${item.fill}18` }}
                                >
                                  <GreenActionIcon type={item.type} size={15} colored />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-gray-900 text-xs">{item.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <div className="h-1.5 w-16 sm:w-20 rounded-full bg-gray-200 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${item.pct}%`, backgroundColor: item.fill }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-semibold">{item.pct}%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-extrabold text-xs text-gray-900">
                                  {item.value.toLocaleString("id-ID")}
                                </span>
                                <span className="block text-[10px] text-gray-400">aksi</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Mode Bento Grid: Metrik Dampak Lingkungan Konkret */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {actionDetails.map((item) => (
                          <div
                            key={item.type}
                            className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/80 p-3 transition hover:shadow-xs hover:border-emerald-200"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: `${item.fill}18` }}
                                >
                                  <GreenActionIcon type={item.type} size={15} colored />
                                </span>
                                <span className="font-bold text-xs text-gray-900 truncate">{item.name}</span>
                              </div>
                              <span className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-extrabold text-gray-700 shrink-0">
                                {item.pct}%
                              </span>
                            </div>

                            <div>
                              <p className="text-lg font-black text-[#0F3D2E]">
                                {item.value.toLocaleString("id-ID")}{" "}
                                <span className="text-xs font-semibold text-gray-500">Aksi</span>
                              </p>
                              <p className="text-[11px] text-[#4D6D5B] mt-0.5 font-medium leading-snug">
                                {item.impactMetric}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                              <span className="text-gray-500 font-medium">EcoPoints Dihasilkan:</span>
                              <span className="font-bold text-[#B7791F]">+{item.points.toLocaleString("id-ID")} Pts</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex flex-col justify-center items-center text-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3">
                          <CheckCircle2 size={22} className="text-emerald-600 mb-1" />
                          <p className="text-xs font-bold text-[#0F3D2E]">Validasi Berkelanjutan</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 max-w-[190px]">
                            Dipantau real-time dengan verifikasi citra AI Google Cloud Vision & audit koordinat.
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="mt-3 text-[11px] text-gray-500">
                      Seluruh aksi diproses melalui audit otomatis label semantik Google Cloud Vision dan audit integritas foto.
                    </p>
                  </Panel>
                </div>

                {/* Kolom Kanan: Status Operasional DLH, Wilayah Prioritas & Quick Access */}
                <div className="flex flex-col gap-6">
                  {/* Indikator Kecepatan & Kesiapsiagaan Tim Regu */}
                  <Panel title="Indikator Performa Layanan Kebersihan">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
                        <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                          <Clock size={15} />
                          <span className="text-[11px] font-bold">Waktu Tanggap Rata-rata</span>
                        </div>
                        <p className="text-xl font-extrabold text-gray-900">
                          {avgHours === null ? "-" : avgHours < 48 ? `${avgHours} Jam` : `${(avgHours / 24).toFixed(1)} Hari`}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Dihitung dari tiket selesai</p>
                      </div>

                      <div className={cn("rounded-xl border p-3.5", criticalOpen > 0 ? "border-red-200 bg-red-50/70" : "border-gray-100 bg-gray-50/80")}>
                        <div className={cn("flex items-center gap-1.5 mb-1", criticalOpen > 0 ? "text-red-700" : "text-gray-600")}>
                          <AlertTriangle size={15} />
                          <span className="text-[11px] font-bold">Laporan Kritis Aktif</span>
                        </div>
                        <p className={cn("text-xl font-extrabold", criticalOpen > 0 ? "text-red-700" : "text-gray-900")}>
                          {criticalOpen} Laporan
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {criticalOpen > 0 ? "Butuh penanganan darurat" : "Semua terkendali"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
                        <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                          <Store size={15} />
                          <span className="text-[11px] font-bold">EcoPoints Beredar</span>
                        </div>
                        <p className="text-xl font-extrabold text-gray-900">
                          {totals.ecoPointsRedeemed.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Ditukarkan di mitra UMKM</p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                          <CheckCircle2 size={15} />
                          <span className="text-[11px] font-bold">Voucher UMKM Aktif</span>
                        </div>
                        <p className="text-xl font-extrabold text-gray-900">
                          {vouchers.length} Kupon
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Peredaran ekonomi lokal</p>
                      </div>
                    </div>
                  </Panel>

                  {/* Wilayah Prioritas Penanganan Sampah */}
                  <Panel
                    title="Wilayah Prioritas Penanganan Sampah"
                    badge={<span className="text-[11px] font-bold text-gray-500">Urutan Urgensi</span>}
                  >
                    {hotspots.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3">Tidak ada wilayah yang memiliki tumpukan sampah terbuka.</p>
                    ) : (
                      <ol className="flex flex-col gap-2">
                        {hotspots.map((d, i) => (
                          <li
                            key={d.kecamatan.id}
                            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-xs text-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-[10px] font-bold text-[#0F3D2E]">
                                {i + 1}
                              </span>
                              <span className="font-bold">{d.kecamatan.name}</span>
                              <span className="text-[10px] text-gray-500">({d.kecamatan.region})</span>
                            </div>
                            <span className="font-semibold text-amber-800">
                              {d.openWasteReports} terbuka {d.criticalOpenReports > 0 && `(${d.criticalOpenReports} kritis)`}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}

                    <button
                      type="button"
                      onClick={() => setSection("spatial")}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <MapIcon size={13} />
                      <span>Buka Peta Intelijen Spasial</span>
                    </button>
                  </Panel>

                  {/* Status Keamanan & AI */}
                  <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs">
                    <p className="text-xs font-bold text-gray-900 mb-2">Protokol Keamanan & Integritas Data</p>
                    <ul className="flex flex-col gap-1.5 text-[11px] text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                        <span>Google Cloud Vision API: Label matching aktif</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                        <span>Deteksi duplikasi citra SHA-256: Proteksi aktif</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                        <span>Pembatasan kuota harian & jeda kirim: Ditegakkan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

            {section === "reports" && <ReportsSection reports={reports} onManage={setManaging} />}

            {section === "actions" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Aksi Hijau Terverifikasi Berdasarkan Kategori" badge={<DataBadge variant="demo" />}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={actionsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis
                        dataKey="name"
                        tick={{ ...lightAxisTick, fontSize: 10 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={lightAxisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={lightTooltipStyle} cursor={{ fill: "#F8FAFC" }} />
                      <Bar dataKey="value" name="Aksi Terverifikasi" radius={[6, 6, 0, 0]}>
                        {actionsByType.map((d) => (
                          <Cell key={d.name} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                <Panel title="Aksi Hijau Berdasarkan 5 Wilayah Surabaya" badge={<DataBadge variant="demo" />}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byRegion(stats, (d) => d.verifiedActions)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ ...lightAxisTick, fontSize: 10 }} />
                      <YAxis tick={lightAxisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={lightTooltipStyle} cursor={{ fill: "#F8FAFC" }} />
                      <Bar dataKey="value" name="Aksi Terverifikasi" fill="#1D9E75" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                <Panel title="Mekanisme Kerja Validasi & Anti-Fraud Aksi Hijau" className="lg:col-span-2">
                  <div className="flex flex-col gap-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <p>
                      Seluruh aksi warga dinyatakan <strong>terverifikasi</strong> hanya jika foto bukti berhasil melewati 3 lapisan proteksi ketat:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
                      <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                        <span className="block font-bold text-[#0F3D2E] mb-1">1. Pemeriksaan Berkas</span>
                        <span>Validasi tipe MIME, kompresi client-side (maks 800KB), dan resolusi minimum untuk kualitas citra yang layak.</span>
                      </li>
                      <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                        <span className="block font-bold text-[#0F3D2E] mb-1">2. Anti-Fraud & Duplikasi</span>
                        <span>Pengecekan hash SHA-256 (mencegah gambar berulang), jeda pengiriman minimal, batas harian, dan geolokasi Surabaya.</span>
                      </li>
                      <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                        <span className="block font-bold text-[#0F3D2E] mb-1">3. AI Label Matching</span>
                        <span>Deteksi label objek Google Cloud Vision dengan pencocokan semantik. Gambar mencurigakan ditandai untuk review dan tidak mendapatkan poin.</span>
                      </li>
                    </ul>
                  </div>
                </Panel>
              </div>
            )}

            {section === "spatial" && (
              <>
                <Panel title="Peta Intelijen Spasial Kota Surabaya" badge={<DataBadge variant="demo" />}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div role="group" aria-label="Pilihan lapisan peta" className="flex gap-1 rounded-xl bg-gray-100 p-1">
                      {(["districts", "reports"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          aria-pressed={spatialLayer === l}
                          onClick={() => setSpatialLayer(l)}
                          className={cn(
                            "rounded-lg px-3.5 py-1.5 text-xs font-bold transition",
                            spatialLayer === l
                              ? "bg-white text-[#0F3D2E] shadow-2xs"
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          {l === "districts" ? "Agregasi 31 Kecamatan" : "Sebaran Titik Laporan Sampah"}
                        </button>
                      ))}
                    </div>

                    {spatialLayer === "districts" && (
                      <div className="flex items-center gap-2">
                        <label htmlFor="gov-metric" className="text-xs font-semibold text-gray-600">
                          Metrik Indikator:
                        </label>
                        <select
                          id="gov-metric"
                          value={metric}
                          onChange={(e) => setMetric(e.target.value as DistrictMetric)}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-[#2D5F3F] focus:outline-none"
                        >
                          {(Object.keys(METRIC_META) as DistrictMetric[]).map((m) => (
                            <option key={m} value={m}>
                              {METRIC_META[m].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {spatialLayer === "districts" ? (
                    <ImpactMapCanvas stats={stats} metric={metric} className="h-[440px] rounded-xl overflow-hidden border border-gray-200" />
                  ) : (
                    <WasteMapCanvas
                      reports={reports}
                      precision={5}
                      onSelect={setManaging}
                      className="h-[440px] rounded-xl overflow-hidden border border-gray-200"
                    />
                  )}

                  <p className="mt-3 text-[11px] text-gray-500">
                    Aksi hijau warga diagregasi per kecamatan guna melindungi privasi warga. Titik laporan sampah liar ditampilkan dengan presisi penuh khusus untuk satuan tugas kebersihan DLH.
                  </p>
                </Panel>

                <Panel title="Tabel Statistik 31 Kecamatan Surabaya" badge={<DataBadge variant="demo" />}>
                  <DistrictTable stats={stats} dark={false} />
                </Panel>
              </>
            )}

            {section === "community" && (
              <div className="grid gap-6 lg:grid-cols-2 items-start">
                <Panel title="Partisipasi Kontributor Aktif per Wilayah" badge={<DataBadge variant="demo" />}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byRegion(stats, (d) => d.activeContributors)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ ...lightAxisTick, fontSize: 10 }} />
                      <YAxis tick={lightAxisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={lightTooltipStyle} cursor={{ fill: "#F8FAFC" }} />
                      <Bar dataKey="value" name="Kontributor Aktif" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                <Panel title="Sinyal Keterlibatan Komunitas Warga">
                  <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                      <span>Total Unggahan di Tembok Komunitas</span>
                      <strong className="text-gray-900 font-bold text-base">{posts.length}</strong>
                    </li>
                    <li className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                      <span>Unggahan Berbukti Aksi Terverifikasi AI</span>
                      <strong className="text-emerald-700 font-bold text-base">
                        {posts.filter((p) => p.verifiedAction).length}
                      </strong>
                    </li>
                    <li className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                      <span>Dukungan Suara Warga (Upvotes Laporan Sampah)</span>
                      <strong className="text-blue-700 font-bold text-base">
                        {reports.reduce((s, r) => s + r.upvotes, 0)}
                      </strong>
                    </li>
                    <li className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                      <span>Kecamatan Surabaya dengan Kontributor Aktif</span>
                      <strong className="text-[#0F3D2E] font-bold text-base">
                        {stats.filter((d) => d.activeContributors > 0).length} dari 31 Kecamatan
                      </strong>
                    </li>
                  </ul>
                  <p className="mt-3 text-[11px] text-gray-500">
                    Menampilkan dinamika interaksi warga Surabaya dalam menjaga kebersihan lingkungan kota.
                  </p>
                </Panel>
              </div>
            )}

            {section === "economy" && (
              <div className="grid gap-6 lg:grid-cols-2 items-start">
                <Panel title="Peredaran EcoPoints per Wilayah (Terbit vs Ditukarkan)" badge={<DataBadge variant="demo" />}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={REGIONS.map((r) => {
                        const ds = stats.filter((d) => d.kecamatan.region === r);
                        return {
                          name: `Surabaya ${r}`,
                          issued: ds.reduce((s, d) => s + d.ecoPointsIssued, 0),
                          redeemed: ds.reduce((s, d) => s + d.ecoPointsRedeemed, 0),
                        };
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ ...lightAxisTick, fontSize: 10 }} />
                      <YAxis tick={lightAxisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={lightTooltipStyle} cursor={{ fill: "#F8FAFC" }} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#475569", paddingTop: 8 }} />
                      <Bar dataKey="issued" name="Poin Diterbitkan" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="redeemed" name="Ditukarkan di UMKM" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Ringkasan Metrik Sirkulasi & Analisis Bawah Chart */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-2.5 text-center">
                      <span className="block text-[10px] font-bold text-amber-800">Total Diterbitkan</span>
                      <span className="block text-sm font-black text-amber-950 mt-0.5">
                        {totals.ecoPointsIssued.toLocaleString("id-ID")}
                      </span>
                      <span className="block text-[9px] text-amber-700/80">Poin Aksi Hijau</span>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-center">
                      <span className="block text-[10px] font-bold text-emerald-800">Terserap di UMKM</span>
                      <span className="block text-sm font-black text-emerald-950 mt-0.5">
                        {totals.ecoPointsRedeemed.toLocaleString("id-ID")}
                      </span>
                      <span className="block text-[9px] text-emerald-700/80">Poin Dibelanjakan</span>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 text-center">
                      <span className="block text-[10px] font-bold text-blue-800">Rasio Perputaran</span>
                      <span className="block text-sm font-black text-blue-950 mt-0.5">
                        {Math.round((totals.ecoPointsRedeemed / Math.max(1, totals.ecoPointsIssued)) * 100)}%
                      </span>
                      <span className="block text-[9px] text-blue-700/80">Efektivitas Sirkular</span>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-gray-500">
                    EcoPoints berfungsi sebagai insentif sirkular yang menghubungkan kepedulian lingkungan warga langsung dengan omset pedagang lokal Surabaya.
                  </p>
                </Panel>

                <Panel title="Mitra UMKM Surabaya Berpartisipasi" badge={<DataBadge variant="demo" label="Mitra Percontohan" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DEMO_MERCHANTS.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 hover:bg-emerald-50/40 hover:border-emerald-200 transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-gray-900 leading-tight">{m.name}</span>
                          <span className="rounded-md bg-white border border-gray-200 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 shrink-0">
                            {m.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 font-medium">
                          Kecamatan {findKecamatan(m.kecamatanId)?.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-[#0F3D2E]">
                    <strong>Dampak Ekonomi Lokal:</strong> Seluruh poin yang ditukarkan warga di atas langsung menjadi omset riil UMKM Surabaya tanpa potongan biaya perantara.
                  </div>
                </Panel>
              </div>
            )}
          </div>
        </main>
      </div>

      {managing && (
        <ReportManager
          report={managing}
          officer={officerNameClean}
          onClose={() => setManaging(null)}
        />
      )}
    </div>
  );
}
