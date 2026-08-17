import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WasteCategory = "overflowing_waste" | "illegal_dumping" | "river_waste" | "street_litter" | "hazardous_waste";
export type WasteSeverity = "low" | "medium" | "high" | "critical";
export type WasteStatus = "reported" | "in_progress" | "resolved" | "rejected";

export interface StatusEvent {
  status: WasteStatus;
  at: string;
  note?: string;
  by?: string;
}

/**
 * Citizen Waste Report. Reports describe PUBLIC places (streets, rivers,
 * vacant lots); the pin is visible to government responders, while public
 * views aggregate by kecamatan.
 */
export interface WasteReport {
  id: string;
  title: string;
  description: string;
  category: WasteCategory;
  severity: WasteSeverity;
  lat: number;
  lng: number;
  address: string;
  kecamatanId: string;
  /** Compressed, EXIF-free JPEG data URLs. */
  photos: string[];
  status: WasteStatus;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  ecoPointsAwarded: number;
  upvotes: number;
  isUpvotedByMe?: boolean;
  reporterName: string;
  reporterUserId?: string;
  history: StatusEvent[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export const CATEGORY_CONFIG: Record<WasteCategory, { label: string; labelId: string }> = {
  overflowing_waste: { label: "Overflowing waste", labelId: "Sampah menumpuk" },
  illegal_dumping: { label: "Illegal dumping site", labelId: "TPS/TPA liar" },
  river_waste: { label: "Waste in river/channel", labelId: "Sampah sungai" },
  street_litter: { label: "Street litter", labelId: "Sampah jalan" },
  hazardous_waste: { label: "Hazardous waste (B3)", labelId: "Limbah B3" },
};

export const SEVERITY_CONFIG: Record<WasteSeverity, { color: string; bg: string; label: string }> = {
  low: { color: "#15803d", bg: "#dcfce7", label: "Ringan" },
  medium: { color: "#a16207", bg: "#fef9c3", label: "Sedang" },
  high: { color: "#c2410c", bg: "#ffedd5", label: "Berat" },
  critical: { color: "#b91c1c", bg: "#fee2e2", label: "Kritis" },
};

export const STATUS_CONFIG: Record<WasteStatus, { color: string; bg: string; label: string }> = {
  reported: { color: "#1d4ed8", bg: "#dbeafe", label: "Menunggu" },
  in_progress: { color: "#b45309", bg: "#fef3c7", label: "Ditindaklanjuti" },
  resolved: { color: "#15803d", bg: "#dcfce7", label: "Selesai" },
  rejected: { color: "#b91c1c", bg: "#fee2e2", label: "Ditolak" },
};

/** Generic response teams for the prototype: not real agencies. */
export const RESPONSE_UNITS = [
  "Tim Truk Pengangkut Sampah DLH",
  "Satuan Saluran & Drainase Dinas SDA",
  "Unit Khusus Penanganan Limbah B3",
  "Pasukan Kuning Kebersihan Taman",
  "Kelompok Relawan Lingkungan Warga",
] as const;

const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

interface SeedInput {
  id: string;
  title: string;
  description: string;
  category: WasteCategory;
  severity: WasteSeverity;
  lat: number;
  lng: number;
  address: string;
  kecamatanId: string;
  status: WasteStatus;
  reportedDaysAgo: number;
  resolvedDaysAgo?: number;
  assignedTo?: string;
  resolutionNotes?: string;
  upvotes: number;
  reporterName: string;
}

function seed(s: SeedInput): WasteReport {
  const history: StatusEvent[] = [{ status: "reported", at: daysAgo(s.reportedDaysAgo) }];
  if (s.status === "in_progress" || s.status === "resolved") {
    history.push({ status: "in_progress", at: daysAgo(Math.max(0, s.reportedDaysAgo - 1)), by: s.assignedTo });
  }
  if (s.status === "resolved") history.push({ status: "resolved", at: daysAgo(s.resolvedDaysAgo ?? 0), note: s.resolutionNotes });
  if (s.status === "rejected") history.push({ status: "rejected", at: daysAgo(Math.max(0, s.reportedDaysAgo - 1)), note: s.resolutionNotes });
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    severity: s.severity,
    lat: s.lat,
    lng: s.lng,
    address: s.address,
    kecamatanId: s.kecamatanId,
    photos: [],
    status: s.status,
    assignedTo: s.assignedTo,
    resolutionNotes: s.resolutionNotes,
    resolvedAt: s.status === "resolved" ? daysAgo(s.resolvedDaysAgo ?? 0) : undefined,
    ecoPointsAwarded: 30,
    upvotes: s.upvotes,
    reporterName: s.reporterName,
    history,
    createdAt: daysAgo(s.reportedDaysAgo),
    updatedAt: history[history.length - 1].at,
    isDemo: true,
  };
}

/** DEMO DATA: fictional reports at plausible public locations in Surabaya. */
export function seedReports(): WasteReport[] {
  return [
    seed({ id: "wr-demo-01", title: "Tumpukan sampah meluber di titik pengumpulan pinggir jalan", description: "Kantong sampah menumpuk dan meluber ke trotoar jalan raya, mengganggu pejalan kaki.", category: "overflowing_waste", severity: "high", lat: -7.2905, lng: 112.7335, address: "Titik kumpul sampah pinggir jalan, Wonokromo", kecamatanId: "wonokromo", status: "in_progress", reportedDaysAgo: 3, assignedTo: RESPONSE_UNITS[0], upvotes: 14, reporterName: "Aditya P." }),
    seed({ id: "wr-demo-02", title: "Sampah plastik tersangkut di bantaran sungai", description: "Sampah plastik dan kemasan menumpuk di belokan saluran sungai dekat jembatan penyeberangan.", category: "river_waste", severity: "critical", lat: -7.2255, lng: 112.7415, address: "Bantaran sungai dekat jembatan, Semampir", kecamatanId: "semampir", status: "reported", reportedDaysAgo: 1, upvotes: 22, reporterName: "Siti R." }),
    seed({ id: "wr-demo-03", title: "Sampah berserakan di sekitar taman kota pasca akhir pekan", description: "Kemasan makanan dan botol minuman tertinggal di area bangku taman kota.", category: "street_litter", severity: "medium", lat: -7.2915, lng: 112.7395, address: "Kawasan taman kota, Wonokromo", kecamatanId: "wonokromo", status: "resolved", reportedDaysAgo: 5, resolvedDaysAgo: 3, assignedTo: RESPONSE_UNITS[3], resolutionNotes: "Area taman telah dibersihkan oleh petugas kebersihan.", upvotes: 8, reporterName: "Budi S." }),
    seed({ id: "wr-demo-04", title: "Drum cairan kimia tanpa label di lahan kosong", description: "Beberapa drum berbau kimia menyengat ditinggalkan di lahan terbuka dekat permukiman.", category: "hazardous_waste", severity: "critical", lat: -7.3215, lng: 112.7755, address: "Lahan kosong kawasan industri, Rungkut", kecamatanId: "rungkut", status: "in_progress", reportedDaysAgo: 2, assignedTo: RESPONSE_UNITS[2], upvotes: 31, reporterName: "Dewi M." }),
    seed({ id: "wr-demo-05", title: "Lahan terbuka berubah menjadi tempat pembuangan liar", description: "Sampah rumah tangga mulai dibuang liar warga di lahan terbuka samping jalan utama.", category: "illegal_dumping", severity: "high", lat: -7.3285, lng: 112.7275, address: "Lahan terbuka samping jalan, Gayungan", kecamatanId: "gayungan", status: "reported", reportedDaysAgo: 0, upvotes: 6, reporterName: "Rizki A." }),
    seed({ id: "wr-demo-06", title: "Serpihan styrofoam dan plastik di sepanjang jalan pesisir", description: "Sekitar 100 meter bahu jalan pesisir dipenuhi serpihan styrofoam dan plastik kemasan.", category: "street_litter", severity: "low", lat: -7.2335, lng: 112.7855, address: "Jalan pesisir Kenjeran, Bulak", kecamatanId: "bulak", status: "reported", reportedDaysAgo: 0, upvotes: 3, reporterName: "Mega S." }),
    seed({ id: "wr-demo-07", title: "Saluran drainase tersumbat tumpukan sampah", description: "Saluran air tersumbat plastik sehingga air meluap ke badan jalan saat hujan deras.", category: "river_waste", severity: "high", lat: -7.2555, lng: 112.7625, address: "Saluran drainase perkotaan, Tambaksari", kecamatanId: "tambaksari", status: "resolved", reportedDaysAgo: 8, resolvedDaysAgo: 6, assignedTo: RESPONSE_UNITS[1], resolutionNotes: "Saluran drainase telah dikeruk dan air kembali lancar.", upvotes: 19, reporterName: "Hendra W." }),
    seed({ id: "wr-demo-08", title: "Bak sampah meluber di pintu masuk pasar tradisional", description: "Bak sampah di depan pasar penuh setiap sore dan mengeluarkan bau menyengat.", category: "overflowing_waste", severity: "medium", lat: -7.2455, lng: 112.7345, address: "Pintu masuk pasar tradisional, Bubutan", kecamatanId: "bubutan", status: "resolved", reportedDaysAgo: 6, resolvedDaysAgo: 4, assignedTo: RESPONSE_UNITS[0], resolutionNotes: "Jadwal ritase truk pengangkut sampah telah ditambah.", upvotes: 11, reporterName: "Lia K." }),
    seed({ id: "wr-demo-09", title: "Puing material bangunan dibuang liar di bahu jalan", description: "Pecahan bata dan semen sisa renovasi dibuang di pinggir jalan mempersempit jalur.", category: "illegal_dumping", severity: "medium", lat: -7.2615, lng: 112.6765, address: "Bahu jalan perumahan, Tandes", kecamatanId: "tandes", status: "rejected", reportedDaysAgo: 4, resolutionNotes: "Laporan duplikat; penanganan telah digabung dengan tiket sebelumnya.", upvotes: 2, reporterName: "Yusuf F." }),
    seed({ id: "wr-demo-10", title: "Sampah jajanan berserakan di sekitar gerbang sekolah", description: "Bungkus plastik makanan ringan berserakan di dekat trotoar sekolah setiap pagi.", category: "street_litter", severity: "low", lat: -7.2885, lng: 112.7945, address: "Sekitar gerbang sekolah, Sukolilo", kecamatanId: "sukolilo", status: "in_progress", reportedDaysAgo: 2, assignedTo: RESPONSE_UNITS[4], upvotes: 5, reporterName: "Nadia N." }),
  ];
}

export interface NewReportInput {
  title: string;
  description: string;
  category: WasteCategory;
  severity: WasteSeverity;
  lat: number;
  lng: number;
  address: string;
  kecamatanId: string;
  photos: string[];
  reporterName: string;
  reporterUserId?: string;
  ecoPointsAwarded: number;
}

interface WasteReportStore {
  reports: WasteReport[];
  addReport: (input: NewReportInput) => WasteReport;
  toggleUpvote: (id: string) => void;
  updateStatus: (id: string, update: { status: WasteStatus; assignedTo?: string; note?: string; by?: string }) => void;
  reset: () => void;
}

export const useWasteReportStore = create<WasteReportStore>()(
  persist(
    (set) => ({
      reports: seedReports(),

      addReport: (input) => {
        const now = new Date().toISOString();
        const report: WasteReport = {
          ...input,
          id: `wr-${Date.now().toString(36)}`,
          status: "reported",
          upvotes: 0,
          isUpvotedByMe: false,
          history: [{ status: "reported", at: now }],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ reports: [report, ...s.reports] }));
        return report;
      },

      toggleUpvote: (id) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id
              ? {
                  ...r,
                  upvotes: r.isUpvotedByMe ? Math.max(0, r.upvotes - 1) : r.upvotes + 1,
                  isUpvotedByMe: !r.isUpvotedByMe,
                }
              : r
          ),
        })),

      updateStatus: (id, { status, assignedTo, note, by }) =>
        set((s) => ({
          reports: s.reports.map((r) => {
            if (r.id !== id) return r;
            const at = new Date().toISOString();
            return {
              ...r,
              status,
              assignedTo: assignedTo || r.assignedTo,
              resolutionNotes: note || r.resolutionNotes,
              resolvedAt: status === "resolved" ? at : r.resolvedAt,
              updatedAt: at,
              history: [...r.history, { status, at, note, by }],
            };
          }),
        })),

      reset: () => set({ reports: seedReports() }),
    }),
    {
      name: "pacul-waste-reports",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ reports: s.reports }),
      migrate: () => ({ reports: seedReports() }),
    }
  )
);

/** Average hours between report and resolution for resolved reports, or null. */
export function averageResolutionHours(reports: WasteReport[]): number | null {
  const resolved = reports.filter((r) => r.status === "resolved" && r.resolvedAt);
  if (resolved.length === 0) return null;
  const total = resolved.reduce((sum, r) => sum + (new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime()), 0);
  return Math.round(total / resolved.length / 3600_000);
}
