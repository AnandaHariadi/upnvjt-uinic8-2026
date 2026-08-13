import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HourlyStep {
  hour: number;
  steps: number;
}

export interface DailySummary {
  date: string;
  steps: number;
}

export type StepMilestone = "m1000" | "m5000" | "m10000";

interface StepTrackerStore {
  isTracking: boolean;
  todaySteps: number;
  hourlyData: HourlyStep[];
  weeklyData: DailySummary[];
  /** Milestones already rewarded, keyed to a calendar day so they pay out once per day. */
  milestoneDay: string;
  milestones: Record<StepMilestone, boolean>;
  setIsTracking: (v: boolean) => void;
  addSteps: (steps: number) => void;
  markMilestone: (m: StepMilestone) => boolean;
  resetToday: () => void;
  reset: () => void;
}

const INITIAL_HOURLY: HourlyStep[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, steps: 0 }));
const NO_MILESTONES: Record<StepMilestone, boolean> = { m1000: false, m5000: false, m10000: false };

/** Sample week shown before real data exists (illustrative). */
const SAMPLE_WEEKLY: DailySummary[] = [
  { date: "Mon", steps: 8200 },
  { date: "Tue", steps: 11350 },
  { date: "Wed", steps: 6800 },
  { date: "Thu", steps: 9500 },
  { date: "Fri", steps: 12100 },
  { date: "Sat", steps: 5300 },
  { date: "Sun", steps: 0 },
];

const today = () => new Date().toDateString();

export const useStepTrackerStore = create<StepTrackerStore>()(
  persist(
    (set, get) => ({
      isTracking: false,
      todaySteps: 0,
      hourlyData: INITIAL_HOURLY,
      weeklyData: SAMPLE_WEEKLY,
      milestoneDay: today(),
      milestones: NO_MILESTONES,

      setIsTracking: (v) => set({ isTracking: v }),

      addSteps: (steps) =>
        set((state) => {
          const hour = new Date().getHours();
          return {
            todaySteps: state.todaySteps + steps,
            hourlyData: state.hourlyData.map((h) => (h.hour === hour ? { ...h, steps: h.steps + steps } : h)),
          };
        }),

      markMilestone: (m) => {
        const s = get();
        const current = s.milestoneDay === today() ? s.milestones : NO_MILESTONES;
        if (current[m]) return false;
        set({ milestoneDay: today(), milestones: { ...current, [m]: true } });
        return true;
      },

      resetToday: () => set({ todaySteps: 0, hourlyData: INITIAL_HOURLY }),

      reset: () =>
        set({ todaySteps: 0, hourlyData: INITIAL_HOURLY, weeklyData: SAMPLE_WEEKLY, milestoneDay: today(), milestones: NO_MILESTONES }),
    }),
    {
      name: "pacul-step-tracker",
      version: 2,
      migrate: () => ({ todaySteps: 0, hourlyData: INITIAL_HOURLY, weeklyData: SAMPLE_WEEKLY, milestoneDay: today(), milestones: NO_MILESTONES }),
      partialize: (s) => ({
        todaySteps: s.todaySteps,
        hourlyData: s.hourlyData,
        weeklyData: s.weeklyData,
        milestoneDay: s.milestoneDay,
        milestones: s.milestones,
      }),
    }
  )
);
