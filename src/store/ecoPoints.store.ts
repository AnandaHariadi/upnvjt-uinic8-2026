import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEMO_STARTING_ECOPOINTS,
  levelFromLifetime,
  pointsToNextLevel,
} from "@/config/eco-points";

export type EcoPointsSource =
  | "green_action"
  | "waste_report"
  | "challenge_join"
  | "challenge_complete"
  | "step_milestone"
  | "electricity_benchmark"
  | "bill_scan"
  | "footprint_log"
  | "marketplace_redeem"
  | "demo_start";

export interface EcoPointsTransaction {
  id: string;
  type: "earn" | "redeem";
  amount: number;
  source: EcoPointsSource;
  label: string;
  /** Related record, e.g. a green action id or voucher id. */
  refId?: string;
  timestamp: string;
}

export interface EcoPointsBalance {
  balance: number;
  lifetimeEarned: number;
  challengesCompleted: number;
  transactions: EcoPointsTransaction[];
}

interface EcoPointsStore extends EcoPointsBalance {
  earn: (amount: number, source: EcoPointsSource, label: string, refId?: string) => EcoPointsTransaction | null;
  redeem: (amount: number, label: string, refId?: string) => { ok: true } | { ok: false; error: string };
  incrementChallengesCompleted: () => void;
  reset: (mode: "demo" | "empty") => void;
}

const MAX_TRANSACTIONS = 100;

function txId() {
  return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function demoState(): EcoPointsBalance {
  return {
    balance: DEMO_STARTING_ECOPOINTS,
    lifetimeEarned: DEMO_STARTING_ECOPOINTS,
    challengesCompleted: 0,
    transactions: [
      {
        id: "tx_demo_start",
        type: "earn",
        amount: DEMO_STARTING_ECOPOINTS,
        source: "demo_start",
        label: "Demo starting balance",
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export const useEcoPointsStore = create<EcoPointsStore>()(
  persist(
    (set, get) => ({
      ...demoState(),

      earn: (amount, source, label, refId) => {
        if (!Number.isFinite(amount) || amount <= 0) return null;
        const tx: EcoPointsTransaction = {
          id: txId(),
          type: "earn",
          amount: Math.round(amount),
          source,
          label,
          refId,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          balance: s.balance + tx.amount,
          lifetimeEarned: s.lifetimeEarned + tx.amount,
          transactions: [tx, ...s.transactions].slice(0, MAX_TRANSACTIONS),
        }));
        return tx;
      },

      redeem: (amount, label, refId) => {
        const { balance } = get();
        if (amount > balance) {
          return {
            ok: false,
            error: `Not enough EcoPoints. This reward needs ${amount.toLocaleString("en-US")}, you have ${balance.toLocaleString("en-US")}.`,
          };
        }
        const tx: EcoPointsTransaction = {
          id: txId(),
          type: "redeem",
          amount: Math.round(amount),
          source: "marketplace_redeem",
          label,
          refId,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          balance: s.balance - tx.amount,
          transactions: [tx, ...s.transactions].slice(0, MAX_TRANSACTIONS),
        }));
        return { ok: true };
      },

      incrementChallengesCompleted: () =>
        set((s) => ({ challengesCompleted: s.challengesCompleted + 1 })),

      reset: (mode) =>
        set(mode === "demo" ? demoState() : { balance: 0, lifetimeEarned: 0, challengesCompleted: 0, transactions: [] }),
    }),
    {
      name: "pacul-ecopoints",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        balance: s.balance,
        lifetimeEarned: s.lifetimeEarned,
        challengesCompleted: s.challengesCompleted,
        transactions: s.transactions,
      }),
    }
  )
);

/** Convenience hook for level progress derived from lifetime EcoPoints. */
export function useEcoPointsLevel() {
  const lifetime = useEcoPointsStore((s) => s.lifetimeEarned);
  return {
    level: levelFromLifetime(lifetime),
    pointsToNextLevel: pointsToNextLevel(lifetime),
  };
}
