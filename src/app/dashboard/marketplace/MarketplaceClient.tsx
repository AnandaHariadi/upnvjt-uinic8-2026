"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Clock, Copy, Download, MapPin, Search, Store, X, Gift, Trophy, Award, Target, TrendingUp, ShieldCheck } from "lucide-react";
import PageWrapper from "@/components/common/PageWrapper";
import DataBadge from "@/components/common/DataBadge";
import Leaderboard from "@/components/features/eco-action/Leaderboard";
import Achievements from "@/components/features/eco-action/Achievements";
import Challenges from "@/components/features/eco-action/Challenges";
import RewardRulesTable from "@/components/features/eco-action/RewardRulesTable";
import { useEcoPointsStore, type EcoPointsTransaction } from "@/store/ecoPoints.store";
import { useVoucherStore, voucherStatus, type UserVoucher, type VoucherStatus } from "@/store/voucher.store";
import { REDEMPTION_STEPS, REWARD_CATEGORIES, type RewardCategory, type RewardItem } from "@/data/demo/umkm-rewards";
import { findKecamatan } from "@/config/surabaya";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/utils/cn";
import { RewardIcon } from "@/components/common/icons";

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const STATUS_STYLE: Record<VoucherStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-[#2D5F3F] text-white" },
  used: { label: "Digunakan", className: "bg-gray-200 text-gray-600" },
  expired: { label: "Kedaluwarsa", className: "bg-red-100 text-red-700" },
};

function RewardTile({ reward, size = "md" }: { reward: RewardItem; size?: "md" | "lg" }) {
  return (
    <div
      role="img"
      aria-label={`Illustration: ${reward.title}`}
      className={cn("flex items-center justify-center rounded-xl bg-gradient-to-br", reward.tile, size === "lg" ? "h-36" : "h-28")}
    >
      <RewardIcon icon={reward.icon} size={size === "lg" ? 56 : 44} className="text-[#2D5F3F]/80" />
    </div>
  );
}

/* ─── Voucher card with QR (exportable) ─── */
function VoucherCard({ voucher, cardRef }: { voucher: UserVoucher; cardRef?: React.RefObject<HTMLDivElement> }) {
  const status = voucherStatus(voucher);
  return (
    <div ref={cardRef} className="flex flex-col items-center gap-3 rounded-2xl border border-[#A8D5BA] bg-white p-5">
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-extrabold tracking-wide text-[#2D5F3F]">PACUL · BURSA PASAR HIJAU</span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">VOUCHER SIMULASI</span>
      </div>
      <span className={cn("w-full rounded-lg py-1 text-center text-xs font-bold", STATUS_STYLE[status].className)}>
        {STATUS_STYLE[status].label}
      </span>
      <div className="text-center">
        <p className="text-base font-extrabold leading-tight text-[#1A1A1A]">{voucher.reward.title}</p>
        <p className="text-xs text-gray-500">{voucher.reward.merchant.name}</p>
      </div>
      <QRCodeSVG value={voucher.qrData} size={148} fgColor="#1a2e1f" aria-label={`Kode QR untuk voucher ${voucher.code}`} />
      <p className="rounded-lg border-2 border-dashed border-[#2D5F3F]/40 bg-[#F0FAF4] px-4 py-2 font-mono text-base font-extrabold tracking-widest text-[#2D5F3F]">
        {voucher.code}
      </p>
      <p className="text-xs text-gray-500">
        Berlaku hingga <strong className="text-[#1A1A1A]">{fmtDate(voucher.expiresAt)}</strong>
      </p>
      <p className="w-full rounded-lg bg-[#F9FAFB] px-3 py-2 text-[10px] text-gray-500">{voucher.reward.terms}</p>
    </div>
  );
}

async function downloadCard(el: HTMLDivElement | null, code: string) {
  if (!el) return;
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `pacul-voucher-${code}.png`;
    a.click();
    toast.success("Gambar voucher berhasil disimpan");
  } catch {
    toast.error("Gagal menyimpan gambar voucher.");
  }
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Kode voucher berhasil disalin");
  } catch {
    toast.error("Gagal menyalin kode. Silakan catat secara manual.");
  }
}

/* ─── Redeem dialog ─── */
type Step = "detail" | "confirm" | "processing" | "success";

function RedeemDialog({ reward, onOpenChange }: { reward: RewardItem | null; onOpenChange: (open: boolean) => void }) {
  const balance = useEcoPointsStore((s) => s.balance);
  const redeem = useVoucherStore((s) => s.redeem);
  const [step, setStep] = useState<Step>("detail");
  const [voucher, setVoucher] = useState<UserVoucher | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const close = (open: boolean) => {
    if (step === "processing") return;
    if (!open) {
      setStep("detail");
      setVoucher(null);
    }
    onOpenChange(open);
  };

  if (!reward) return null;
  const affordable = balance >= reward.ecoPointsCost;
  const outOfStock = reward.stock <= 0;

  const confirm = async () => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 700));
    const result = redeem(reward.id);
    if (!result.ok) {
      toast.error(result.error);
      setStep("detail");
      return;
    }
    setVoucher(result.voucher);
    setStep("success");
    toast.success(`Berhasil menukarkan kupon: ${reward.title}`);
  };

  return (
    <Dialog.Root open={!!reward} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
          aria-describedby={undefined}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-4">
            <Dialog.Title className="text-base font-bold text-[#1A1A1A]">
              {step === "success" ? "Voucher Siap Digunakan" : step === "confirm" ? "Konfirmasi Penukaran" : "Detail Kupon UMKM"}
            </Dialog.Title>
            {step !== "processing" && (
              <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100" aria-label="Tutup">
                <X size={18} />
              </Dialog.Close>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5">
            {step === "detail" && (
              <>
                <RewardTile reward={reward} size="lg" />
                <div>
                  <p className="text-lg font-bold text-[#1A1A1A]">{reward.title}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Store size={12} aria-hidden="true" /> {reward.merchant.name} · {reward.merchant.type}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} aria-hidden="true" /> {findKecamatan(reward.merchant.kecamatanId)?.name}, Surabaya
                  </p>
                  <DataBadge variant="demo" label="Mitra Simulasi" className="mt-2" />
                </div>
                <p className="text-sm text-gray-600">{reward.description}</p>
                <div className="rounded-xl bg-[#F9FAFB] p-3 text-xs text-gray-600">
                  <p className="mb-1 font-semibold text-gray-700">Alur Penukaran Kupon</p>
                  <ol className="list-decimal space-y-0.5 pl-4">
                    {REDEMPTION_STEPS.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                  <p className="mt-2"><span className="font-semibold">Ketentuan:</span> {reward.terms} Berlaku {reward.validityDays} hari.</p>
                </div>
                <dl className="grid grid-cols-2 gap-2 rounded-xl border border-[#E5E7EB] p-3 text-sm">
                  <dt className="text-gray-500">Saldo Anda</dt>
                  <dd className="text-right font-bold">{fmt(balance)}</dd>
                  <dt className="text-gray-500">Biaya Penukaran</dt>
                  <dd className="text-right font-bold text-[#2D5F3F]">−{fmt(reward.ecoPointsCost)}</dd>
                  <dt className="text-gray-500">Sisa Saldo</dt>
                  <dd className={cn("text-right font-bold", affordable ? "text-[#1A1A1A]" : "text-red-600")}>{fmt(balance - reward.ecoPointsCost)}</dd>
                </dl>
                {!affordable && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                    Saldo EcoPoints Anda kurang {fmt(reward.ecoPointsCost - balance)}.{" "}
                    <Link href="/dashboard/eco-action" className="font-semibold underline">Verifikasi aksi hijau</Link> untuk menambah poin.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  disabled={!affordable || outOfStock}
                  className="w-full rounded-xl bg-[#2D5F3F] py-3.5 text-sm font-bold text-white hover:bg-[#245033] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {outOfStock ? "Stok Habis" : !affordable ? "EcoPoints Tidak Cukup" : `Tukarkan dengan ${fmt(reward.ecoPointsCost)} EcoPoints`}
                </button>
              </>
            )}

            {step === "confirm" && (
              <>
                <p className="text-sm text-gray-600">
                  Tukarkan <strong>{reward.title}</strong> dari <strong>{reward.merchant.name}</strong> dengan{" "}
                  <strong>{fmt(reward.ecoPointsCost)} EcoPoints</strong>? Penukaran voucher ini merupakan simulasi ekosistem lokal.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep("detail")} className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Kembali
                  </button>
                  <button type="button" onClick={confirm} className="flex-1 rounded-xl bg-[#2D5F3F] py-3 text-sm font-bold text-white hover:bg-[#245033]">
                    Ya, Tukarkan
                  </button>
                </div>
              </>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center gap-3 py-10" role="status">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#2D5F3F]/20 border-t-[#2D5F3F]" aria-hidden="true" />
                <p className="font-semibold text-gray-600">Memproses penukaran voucher…</p>
              </div>
            )}

            {step === "success" && voucher && (
              <>
                <VoucherCard voucher={voucher} cardRef={cardRef} />
                <div className="flex gap-3">
                  <button type="button" onClick={() => copyCode(voucher.code)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2D5F3F] py-3 text-sm font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4]">
                    <Copy size={14} aria-hidden="true" /> Salin Kode
                  </button>
                  <button type="button" onClick={() => downloadCard(cardRef.current, voucher.code)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-3 text-sm font-bold text-white hover:bg-[#245033]">
                    <Download size={14} aria-hidden="true" /> Simpan Gambar
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── Voucher viewer (My Vouchers) ─── */
function VoucherDialog({ voucher, onOpenChange }: { voucher: UserVoucher | null; onOpenChange: (o: boolean) => void }) {
  const markUsed = useVoucherStore((s) => s.markUsed);
  const cardRef = useRef<HTMLDivElement>(null);
  if (!voucher) return null;
  const status = voucherStatus(voucher);

  const use = () => {
    const r = markUsed(voucher.id);
    if (r.ok) {
      toast.success("Kupon berhasil ditandai telah digunakan (simulasi kasir UMKM).");
      onOpenChange(false);
    } else toast.error(r.error);
  };

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
          aria-describedby={undefined}
        >
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-bold">Kupon Saya</Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100" aria-label="Tutup"><X size={18} /></Dialog.Close>
          </div>
          <VoucherCard voucher={voucher} cardRef={cardRef} />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => copyCode(voucher.code)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2D5F3F] py-2.5 text-xs font-semibold text-[#2D5F3F]">
              <Copy size={13} aria-hidden="true" /> Salin Kode
            </button>
            <button type="button" onClick={() => downloadCard(cardRef.current, voucher.code)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D5F3F] py-2.5 text-xs font-bold text-white">
              <Download size={13} aria-hidden="true" /> Simpan
            </button>
          </div>
          {status === "active" && (
            <button type="button" onClick={use} className="mt-2 w-full rounded-xl border border-gray-200 py-2.5 text-xs text-gray-600 hover:bg-gray-50">
              Simulasikan pemindaian kasir UMKM (Tandai Digunakan)
            </button>
          )}
          {status === "expired" && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">Kupon ini telah kedaluwarsa pada {fmtDate(voucher.expiresAt)} dan tidak dapat digunakan lagi.</p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── Tabs ─── */
function Catalog({ onSelect }: { onSelect: (r: RewardItem) => void }) {
  const rewards = useVoucherStore((s) => s.rewards);
  const vouchers = useVoucherStore((s) => s.userVouchers);
  const balance = useEcoPointsStore((s) => s.balance);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<RewardCategory | "all">("all");
  const [sort, setSort] = useState<"featured" | "cost-asc" | "cost-desc">("featured");

  const owned = new Set(vouchers.filter((v) => voucherStatus(v) === "active").map((v) => v.rewardId));
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = rewards.filter(
      (r) =>
        (cat === "all" || r.category === cat) &&
        (!needle || r.title.toLowerCase().includes(needle) || r.merchant.name.toLowerCase().includes(needle))
    );
    if (sort === "cost-asc") return [...filtered].sort((a, b) => a.ecoPointsCost - b.ecoPointsCost);
    if (sort === "cost-desc") return [...filtered].sort((a, b) => b.ecoPointsCost - a.ecoPointsCost);
    return filtered;
  }, [rewards, q, cat, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="reward-search" className="sr-only">Cari kupon atau gerai UMKM</label>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="reward-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kupon atau gerai UMKM…"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
          />
        </div>
        <label className="sr-only" htmlFor="reward-sort">Urutan</label>
        <select id="reward-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm">
          <option value="featured">Rekomendasi</option>
          <option value="cost-asc">EcoPoints Terendah</option>
          <option value="cost-desc">EcoPoints Tertinggi</option>
        </select>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter berdasarkan kategori">
        {REWARD_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              cat === c.id ? "bg-[#2D5F3F] text-white" : "bg-white text-gray-600 ring-1 ring-[#E5E7EB] hover:bg-gray-50"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[#E5E7EB] py-12 text-center text-sm text-gray-500">Tidak ada kupon yang cocok dengan pencarian Anda.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((r) => {
            const isOwned = owned.has(r.id);
            const affordable = balance >= r.ecoPointsCost;
            return (
              <li key={r.id} className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
                <RewardTile reward={r} />
                <p className="mt-3 text-sm font-bold leading-tight text-[#1A1A1A]">{r.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{r.merchant.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MapPin size={10} aria-hidden="true" /> {findKecamatan(r.merchant.kecamatanId)?.name}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#2D5F3F]">{fmt(r.ecoPointsCost)} <span className="text-[10px] font-semibold">EcoPoints</span></span>
                  <span className={cn("text-[11px]", r.stock < 10 ? "font-semibold text-red-600" : "text-gray-400")}>
                    {r.stock > 0 ? `${r.stock} tersisa` : "Stok habis"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  disabled={isOwned}
                  className={cn(
                    "mt-3 w-full rounded-xl py-2.5 text-xs font-bold",
                    isOwned
                      ? "bg-[#F0FAF4] text-[#2D5F3F]"
                      : r.stock > 0 && affordable
                        ? "bg-[#2D5F3F] text-white hover:bg-[#245033]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {isOwned ? "Kupon Aktif Dimiliki" : r.stock <= 0 ? "Stok Habis" : affordable ? "Tukarkan" : `Lihat · Kurang ${fmt(r.ecoPointsCost - balance)} poin`}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MyVouchers() {
  const vouchers = useVoucherStore((s) => s.userVouchers);
  const [open, setOpen] = useState<UserVoucher | null>(null);
  if (vouchers.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[#E5E7EB] py-12 text-center text-sm text-gray-500">
        Belum ada kupon yang ditukarkan. Tukarkan voucher dari katalog untuk mendapatkan kupon pertama Anda.
      </p>
    );
  }
  return (
    <>
      <ul className="flex flex-col gap-3">
        {vouchers.map((v) => {
          const status = voucherStatus(v);
          return (
            <li key={v.id} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0FAF4]"><RewardIcon icon={v.reward.icon} size={20} className="text-[#2D5F3F]" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1A1A1A]">{v.reward.title}</p>
                <p className="text-xs text-gray-500">{v.reward.merchant.name} · {v.code}</p>
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock size={10} aria-hidden="true" />
                  {status === "used" && v.usedAt ? `Digunakan ${fmtDate(v.usedAt)}` : status === "expired" ? `Kedaluwarsa ${fmtDate(v.expiresAt)}` : `Berlaku hingga ${fmtDate(v.expiresAt)}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", STATUS_STYLE[status].className)}>{STATUS_STYLE[status].label}</span>
                <button type="button" onClick={() => setOpen(v)} className="rounded-lg border border-[#2D5F3F] px-2.5 py-1 text-[11px] font-semibold text-[#2D5F3F] hover:bg-[#F0FAF4]">
                  Lihat
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {open && <VoucherDialog voucher={open} onOpenChange={(o) => !o && setOpen(null)} />}
    </>
  );
}

function PointsHistory() {
  const txs = useEcoPointsStore((s) => s.transactions);
  if (txs.length === 0) return <p className="py-8 text-center text-sm text-gray-500">Belum ada riwayat aktivitas EcoPoints.</p>;
  return (
    <ul className="divide-y divide-[#F3F4F6] rounded-2xl border border-[#E5E7EB] bg-white">
      {txs.map((t: EcoPointsTransaction) => (
        <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-[#1A1A1A]">{t.label}</p>
            <p className="text-[11px] text-gray-400">{new Date(t.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <span className={cn("shrink-0 text-sm font-bold", t.type === "earn" ? "text-[#2D5F3F]" : "text-red-600")}>
            {t.type === "earn" ? "+" : "−"}{fmt(t.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Main Hub Page ─── */
type MainTab = "voucher" | "leaderboard" | "achievements" | "challenges";

export default function MarketplaceClient() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const balance = useEcoPointsStore((s) => s.balance);
  const activeCount = useVoucherStore((s) => s.userVouchers.filter((v) => voucherStatus(v) === "active").length);

  const tabParam = searchParams.get("tab");
  const initialMainTab: MainTab = useMemo(() => {
    if (tabParam === "leaderboard" || tabParam === "peringkat") return "leaderboard";
    if (tabParam === "achievements" || tabParam === "lencana") return "achievements";
    if (tabParam === "challenges" || tabParam === "tantangan") return "challenges";
    return "voucher";
  }, [tabParam]);

  const [mainTab, setMainTab] = useState<MainTab>(initialMainTab);
  const [subTab, setSubTab] = useState<"catalog" | "vouchers" | "history">("catalog");
  const [selected, setSelected] = useState<RewardItem | null>(null);

  useEffect(() => {
    if (tabParam === "leaderboard" || tabParam === "peringkat") setMainTab("leaderboard");
    else if (tabParam === "achievements" || tabParam === "lencana") setMainTab("achievements");
    else if (tabParam === "challenges" || tabParam === "tantangan") setMainTab("challenges");
    else if (tabParam === "voucher" || tabParam === "hadiah") setMainTab("voucher");
  }, [tabParam]);

  const handleMainTabChange = (t: MainTab) => {
    setMainTab(t);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const mainTabs = [
    { id: "voucher", label: "Tukar Voucher UMKM", icon: Gift },
    { id: "leaderboard", label: "Papan Peringkat", icon: Trophy },
    { id: "achievements", label: "Lencana & Prestasi", icon: Award },
    { id: "challenges", label: "Tantangan & Ketentuan Poin", icon: Target },
  ] as const;

  const voucherSubTabs = [
    { id: "catalog", label: "Katalog Kupon" },
    { id: "vouchers", label: `Kupon Saya (${hydrated ? activeCount : 0})` },
    { id: "history", label: "Riwayat EcoPoints" },
  ] as const;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-5">
        {/* Header Terpadu Pusat Hadiah & Prestasi */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2D5F3F]">Reward & Gamifikasi</p>
            <h1 className="text-xl font-extrabold text-[#1A1A1A] sm:text-2xl">Pusat Hadiah & Prestasi</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Satu tempat terpadu untuk menukarkan EcoPoints dengan voucher UMKM lokal Surabaya, memantau peringkat kontribusi warga,
              meraih lencana prestasi, dan menyelesaikan misi aksi hijau.
            </p>
          </div>
          <div className="rounded-2xl border border-[#A8D5BA] bg-[#F0FAF4] px-4 py-2.5" aria-live="polite">
            <p className="text-[11px] font-semibold text-gray-500">Saldo EcoPoints Anda</p>
            <p className="text-xl font-extrabold text-[#2D5F3F]">{hydrated ? fmt(balance) : "-"}</p>
          </div>
        </header>

        {/* Tab Navigasi Utama */}
        <nav role="tablist" aria-label="Kategori Pusat Hadiah & Prestasi" className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-1.5">
          {mainTabs.map((t) => {
            const Icon = t.icon;
            const isSelected = mainTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => handleMainTabChange(t.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                  isSelected
                    ? "bg-[#2D5F3F] text-white shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-[#2D5F3F]"
                )}
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Konten Berdasarkan Tab Utama */}
        {mainTab === "voucher" && (
          <div className="flex flex-col gap-4">
            <section aria-label="Alur Bursa Pasar Hijau" className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#2D5F3F]">
                {["Aksi Hijau Warga", "EcoPoints", "Mitra UMKM Lokal", "Produk & Voucher", "Ekonomi Sirkular Lokal"].map((s, i, arr) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="rounded-full bg-[#F0FAF4] px-2.5 py-1">{s}</span>
                    {i < arr.length - 1 && <ArrowRight size={12} className="text-gray-400" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                <DataBadge variant="demo" label="Mitra Simulasi" />
                Seluruh mitra UMKM yang ditampilkan adalah contoh simulasi ekosistem sirkular lokal Surabaya.
              </p>
            </section>

            <div role="tablist" aria-label="Sub-bagian Voucher" className="flex gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
              {voucherSubTabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={subTab === t.id}
                  onClick={() => setSubTab(t.id)}
                  className={cn(
                    "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold",
                    subTab === t.id ? "bg-white text-[#2D5F3F] shadow-sm" : "text-gray-500 hover:text-[#2D5F3F]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div role="tabpanel">
              {!hydrated ? (
                <div className="h-40 animate-pulse rounded-2xl bg-gray-100" aria-hidden="true" />
              ) : subTab === "catalog" ? (
                <Catalog onSelect={setSelected} />
              ) : subTab === "vouchers" ? (
                <MyVouchers />
              ) : (
                <PointsHistory />
              )}
            </div>
          </div>
        )}

        {mainTab === "leaderboard" && (
          <div className="grid gap-5 lg:grid-cols-[60fr_40fr] items-start">
            {/* Kolom Kiri: Papan Peringkat Warga Surabaya */}
            <Leaderboard />

            {/* Kolom Kanan: Status Posisi Anda, Peringkat Kecamatan & Aksi Cepat Sejajar */}
            <div className="flex flex-col gap-4">
              {/* Kartu 1: Posisi & Target Naik Peringkat */}
              <section className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F3D2E]">
                      <Trophy size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-[#0F3D2E]">
                      Posisi Anda Saat Ini
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#0F3D2E]">
                    Peringkat #6
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl border border-gray-100 bg-[#FAFCFB] p-2.5">
                    <span className="block text-[10px] text-gray-500">Poin Anda</span>
                    <span className="text-sm font-black text-[#0F3D2E]">500 Poin</span>
                    <span className="block text-[9px] text-gray-400 mt-0.5">Kec. Wonokromo</span>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
                    <span className="block text-[10px] text-emerald-800 font-semibold">Ke Peringkat #5</span>
                    <span className="text-sm font-black text-[#0F3D2E]">110 Poin Lagi</span>
                    <span className="block text-[9px] text-emerald-700 mt-0.5">vs Ayu R. (610 pts)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Progres Masuk Top 5 Surabaya</span>
                    <span className="font-bold text-[#0F3D2E]">82%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#15803D]"
                      style={{ width: "82%" }}
                    />
                  </div>
                </div>
              </section>

              {/* Kartu 2: Peringkat Kecamatan Terhijau Surabaya */}
              <section className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F3D2E]">
                      <MapPin size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-[#0F3D2E]">
                      Kecamatan Terhijau Surabaya
                    </h3>
                  </div>
                  <span className="text-[10px] text-gray-400">Total Akumulasi</span>
                </div>

                <div className="space-y-2">
                  {[
                    { rank: 1, name: "Gubeng", points: 4820, isMine: false, badge: "🥇 Juara 1" },
                    { rank: 2, name: "Wonokromo", points: 4150, isMine: true, badge: "Wilayah Anda" },
                    { rank: 3, name: "Tegalsari", points: 3790, isMine: false, badge: "🥉 Juara 3" },
                    { rank: 4, name: "Rungkut", points: 3240, isMine: false, badge: "Top 4" },
                  ].map((k) => (
                    <div
                      key={k.name}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs",
                        k.isMine
                          ? "bg-emerald-50/80 border border-emerald-200/80 font-bold"
                          : "bg-[#FAFCFB] border border-gray-100 text-gray-700"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                          k.rank === 1 ? "bg-amber-100 text-amber-800" :
                          k.rank === 2 ? "bg-emerald-600 text-white" :
                          k.rank === 3 ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {k.rank}
                        </span>
                        <span>Kec. {k.name}</span>
                        {k.isMine && (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                            {k.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-[#0F3D2E]">
                        {k.points.toLocaleString("id-ID")} pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tombol CTA Penutup Sejajar dengan Kolom Kiri */}
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/dashboard/eco-action"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D2E] py-2.5 text-xs font-bold text-white hover:bg-[#18533F] transition-colors shadow-xs"
                  >
                    <span>Kirim Aksi untuk Naik Peringkat</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        )}

        {mainTab === "achievements" && (
          <div className="flex flex-col gap-5">
            <Achievements />
            <div className="rounded-[12px] border border-emerald-200 bg-[#F0FAF4] p-4 text-xs text-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#2D5F3F] shrink-0" />
                <span>
                  Selesaikan berbagai kategori aksi hijau (sampah, transportasi umum, hemat energi, dan gotong royong) untuk membuka lencana eksklusif berikutnya.
                </span>
              </div>
              <Link
                href="/dashboard/eco-action"
                className="shrink-0 rounded-lg bg-[#2D5F3F] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#245033] transition-colors"
              >
                Mulai Aksi Baru →
              </Link>
            </div>
          </div>
        )}

        {mainTab === "challenges" && (
          <div className="flex flex-col gap-6">
            <Challenges />
            <RewardRulesTable />
          </div>
        )}
      </div>
      <RedeemDialog key={selected?.id ?? "none"} reward={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </PageWrapper>
  );
}
