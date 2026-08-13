import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEMO_REWARDS, type RewardItem } from "@/data/demo/umkm-rewards";
import { useEcoPointsStore } from "@/store/ecoPoints.store";

export type VoucherStatus = "active" | "used" | "expired";

export interface UserVoucher {
  id: string;
  rewardId: string;
  /** Snapshot of the reward at redemption time. */
  reward: RewardItem;
  code: string;
  qrData: string;
  ecoPointsSpent: number;
  status: Exclude<VoucherStatus, "expired">;
  redeemedAt: string;
  expiresAt: string;
  usedAt?: string;
}

export type RedeemResult =
  | { ok: true; voucher: UserVoucher }
  | { ok: false; error: string };

/** Status including expiry, which is derived from the current time. */
export function voucherStatus(v: UserVoucher, now = Date.now()): VoucherStatus {
  if (v.status === "used") return "used";
  return new Date(v.expiresAt).getTime() <= now ? "expired" : "active";
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const c = typeof crypto !== "undefined" ? crypto : (typeof globalThis !== "undefined" ? globalThis.crypto : undefined);
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(6);
    c.getRandomValues(bytes);
    const s = Array.from(bytes, (b) => chars[b % chars.length]).join("");
    return `PCL-${s.slice(0, 3)}-${s.slice(3)}`;
  }
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `PCL-${s.slice(0, 3)}-${s.slice(3)}`;
}

interface VoucherStore {
  rewards: RewardItem[];
  userVouchers: UserVoucher[];
  redeem: (rewardId: string) => RedeemResult;
  markUsed: (voucherId: string) => { ok: boolean; error?: string };
  reset: () => void;
}

export const useVoucherStore = create<VoucherStore>()(
  persist(
    (set, get) => ({
      rewards: DEMO_REWARDS,
      userVouchers: [],

      redeem: (rewardId) => {
        const reward = get().rewards.find((r) => r.id === rewardId);
        if (!reward) return { ok: false, error: "Hadiah voucher ini sudah tidak tersedia." };
        if (reward.stock <= 0) return { ok: false, error: "Stok kupon ini telah habis." };
        const hasActive = get().userVouchers.some((v) => v.rewardId === rewardId && voucherStatus(v) === "active");
        if (hasActive) return { ok: false, error: "Anda masih memiliki kupon aktif untuk penawaran ini." };

        const code = generateCode();
        const payment = useEcoPointsStore.getState().redeem(reward.ecoPointsCost, `Penukaran Kupon: ${reward.title}`, code);
        if (!payment.ok) return { ok: false, error: payment.error };

        const now = Date.now();
        const expiresAt = new Date(now + reward.validityDays * 86400_000).toISOString();
        const voucher: UserVoucher = {
          id: `uv_${now.toString(36)}`,
          rewardId,
          reward,
          code,
          qrData: JSON.stringify({ app: "PACUL", demo: true, code, reward: rewardId, merchant: reward.merchant.id, exp: expiresAt }),
          ecoPointsSpent: reward.ecoPointsCost,
          status: "active",
          redeemedAt: new Date(now).toISOString(),
          expiresAt,
        };
        set((s) => ({
          rewards: s.rewards.map((r) => (r.id === rewardId ? { ...r, stock: r.stock - 1 } : r)),
          userVouchers: [voucher, ...s.userVouchers],
        }));
        return { ok: true, voucher };
      },

      markUsed: (voucherId) => {
        const v = get().userVouchers.find((x) => x.id === voucherId);
        if (!v) return { ok: false, error: "Kupon tidak ditemukan." };
        const status = voucherStatus(v);
        if (status === "expired") return { ok: false, error: "Kupon ini telah kedaluwarsa dan tidak dapat digunakan lagi." };
        if (status === "used") return { ok: false, error: "Kupon ini sudah pernah digunakan sebelumnya." };
        set((s) => ({
          userVouchers: s.userVouchers.map((x) =>
            x.id === voucherId ? { ...x, status: "used", usedAt: new Date().toISOString() } : x
          ),
        }));
        return { ok: true };
      },

      reset: () => set({ rewards: DEMO_REWARDS, userVouchers: [] }),
    }),
    {
      name: "pacul-bursa-pasar-hijau",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({ rewards: DEMO_REWARDS, userVouchers: [] }),
      partialize: (s) => ({ rewards: s.rewards, userVouchers: s.userVouchers }),
    }
  )
);
