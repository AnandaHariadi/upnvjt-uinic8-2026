import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GreenActionRecord } from "@/types/green-action";
import { GREEN_ACTIONS } from "@/config/green-actions";

const MAX_RECORDS = 40;

interface GreenActionStore {
  actions: GreenActionRecord[];
  addAction: (record: GreenActionRecord) => void;
  markShared: (actionId: string) => void;
  reset: (mode: "demo" | "empty", userId: string) => void;
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

/** Two clearly-labelled simulated records so the demo history is not empty. */
function demoSeed(userId: string): GreenActionRecord[] {
  const waste = GREEN_ACTIONS.waste_sorting;
  const bike = GREEN_ACTIONS.sustainable_transport;
  return [
    {
      actionId: "ga_demo_2",
      userId,
      actionType: "sustainable_transport",
      evidenceHash: "demo-seed-2",
      verificationStatus: "verified",
      verificationReason: "Aksi transportasi ramah lingkungan terverifikasi.",
      verificationConfidence: 0.94,
      verificationMode: "demo",
      flags: [],
      timestamp: hoursAgo(26),
      location: { kecamatanId: "wonokromo", precision: "district" },
      estimatedImpact: { metric: bike.impactMetric, quantity: 4, unit: "km", estimatedCo2eKg: bike.estimateCo2Kg(4) },
      ecoPointsAwarded: 50,
    },
    {
      actionId: "ga_demo_1",
      userId,
      actionType: "waste_sorting",
      evidenceHash: "demo-seed-1",
      verificationStatus: "verified",
      verificationReason: "Pilah sampah dapur rumah tangga terverifikasi.",
      verificationConfidence: 0.96,
      verificationMode: "demo",
      flags: [],
      timestamp: hoursAgo(50),
      location: { kecamatanId: "wonokromo", precision: "district" },
      estimatedImpact: { metric: waste.impactMetric, quantity: 1.5, unit: "kg", estimatedCo2eKg: 0.5 },
      ecoPointsAwarded: 40,
    },
  ];
}

export const useGreenActionStore = create<GreenActionStore>()(
  persist(
    (set) => ({
      actions: [],

      addAction: (record) =>
        set((s) => ({ actions: [record, ...s.actions].slice(0, MAX_RECORDS) })),

      markShared: (actionId) =>
        set((s) => ({
          actions: s.actions.map((a) => (a.actionId === actionId ? { ...a, sharedToCommunity: true } : a)),
        })),

      reset: (mode, userId) => set({ actions: mode === "demo" ? demoSeed(userId) : [] }),
    }),
    {
      name: "pacul-green-actions",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
