import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";
import type { GreenActionType } from "@/config/green-actions";

/**
 * Community challenges. Progress is driven by VERIFIED green actions of the
 * matching type, so completing a challenge always implies verified evidence.
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  actionType: GreenActionType;
  iconColor: string;
  /** Number of verified actions required. */
  target: number;
  progress: number;
  durationDays: number;
  /** Demo participant count (illustrative). */
  participants: number;
  ecoPointsReward: number;
  isJoined: boolean;
  isCompleted: boolean;
  joinedAt?: string;
  completedAt?: string;
}

export interface ChallengeUpdate {
  challenge: Challenge;
  completed: boolean;
}

function seedChallenges(mode: "demo" | "empty" = "demo"): Challenge[] {
  const demo = mode === "demo";
  return [
    {
      id: "ch_sort_week",
      title: "Pekan Pilah Sampah Rumah Tangga",
      description: "Verifikasi 3 kali pemilahan sampah dapur untuk mengurangi timbulan ke TPA Benowo.",
      actionType: "waste_sorting",
      iconColor: "#10B981",
      target: 3,
      progress: demo ? 2 : 0,
      durationDays: 7,
      participants: 128,
      ecoPointsReward: 100,
      isJoined: demo,
      isCompleted: false,
      joinedAt: demo ? new Date(Date.now() - 2 * 86400_000).toISOString() : undefined,
    },
    {
      id: "ch_jelantah",
      title: "Koleksi Minyak Jelantah",
      description: "Kumpulkan minyak goreng jelantah ke dalam jeriken atau botol tertutup.",
      actionType: "used_cooking_oil",
      iconColor: "#F59E0B",
      target: 2,
      progress: 0,
      durationDays: 14,
      participants: 64,
      ecoPointsReward: 120,
      isJoined: false,
      isCompleted: false,
    },
    {
      id: "ch_green_commute",
      title: "Mobilitas Rendah Emisi",
      description: "Verifikasi 5 perjalanan hemat energi dengan sepeda, jalan kaki, atau Suroboyo Bus.",
      actionType: "sustainable_transport",
      iconColor: "#2563EB",
      target: 5,
      progress: 0,
      durationDays: 14,
      participants: 203,
      ecoPointsReward: 120,
      isJoined: false,
      isCompleted: false,
    },
    {
      id: "ch_plant_kampung",
      title: "Penghijauan Pekarangan Kampung",
      description: "Tanam dan rawat 2 bibit pohon atau tanaman hias di lingkungan rumah.",
      actionType: "tree_planting",
      iconColor: "#059669",
      target: 2,
      progress: 0,
      durationDays: 30,
      participants: 47,
      ecoPointsReward: 150,
      isJoined: false,
      isCompleted: false,
    },
  ];
}

interface EcoActionStore {
  challenges: Challenge[];
  joinChallenge: (challengeId: string) => void;
  /** Called after a verified green action; returns the challenges that progressed. */
  recordVerifiedAction: (actionType: GreenActionType) => ChallengeUpdate[];
  reset: (mode: "demo" | "empty") => void;
}

export const useEcoActionStore = create<EcoActionStore>()(
  persist(
    (set, get) => ({
      challenges: seedChallenges(),

      joinChallenge: (challengeId) => {
        const target = get().challenges.find((c) => c.id === challengeId);
        if (!target || target.isJoined) return;
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, isJoined: true, participants: c.participants + 1, joinedAt: new Date().toISOString() }
              : c
          ),
        }));
        const src = SUPPORTING_ECOPOINT_SOURCES.CHALLENGE_JOIN;
        useEcoPointsStore.getState().earn(src.amount, "challenge_join", `${src.label}: ${target.title}`, challengeId);
      },

      recordVerifiedAction: (actionType) => {
        const updates: ChallengeUpdate[] = [];
        const next = get().challenges.map((c) => {
          if (!c.isJoined || c.isCompleted || c.actionType !== actionType) return c;
          const progress = Math.min(c.target, c.progress + 1);
          const completed = progress >= c.target;
          const updated: Challenge = {
            ...c,
            progress,
            isCompleted: completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
          updates.push({ challenge: updated, completed });
          return updated;
        });
        set({ challenges: next });

        // Award completion rewards exactly once, here.
        const points = useEcoPointsStore.getState();
        for (const u of updates) {
          if (!u.completed) continue;
          points.earn(u.challenge.ecoPointsReward, "challenge_complete", `Challenge completed: ${u.challenge.title}`, u.challenge.id);
          points.incrementChallengesCompleted();
        }
        return updates;
      },

      reset: (mode) => set({ challenges: seedChallenges(mode) }),
    }),
    {
      name: "pacul-challenges",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ challenges: s.challenges }),
      migrate: () => ({ challenges: seedChallenges("demo") }),
    }
  )
);

export function challengeProgressPercent(c: Pick<Challenge, "progress" | "target">): number {
  return Math.round((c.progress / Math.max(1, c.target)) * 100);
}

export function challengeDaysLeft(c: Challenge): number {
  if (!c.joinedAt) return c.durationDays;
  const elapsed = Math.floor((Date.now() - new Date(c.joinedAt).getTime()) / 86400_000);
  return Math.max(0, c.durationDays - elapsed);
}
