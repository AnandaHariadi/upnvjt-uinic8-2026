import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GuideVisit = "map" | "gov";

interface JudgeGuideStore {
  dismissed: boolean;
  visited: Partial<Record<GuideVisit, boolean>>;
  markVisited: (v: GuideVisit) => void;
  setDismissed: (d: boolean) => void;
}

/** Progress of the guided Judge Demo checklist (per browser). */
export const useJudgeGuideStore = create<JudgeGuideStore>()(
  persist(
    (set) => ({
      dismissed: false,
      visited: {},
      markVisited: (v) => set((s) => (s.visited[v] ? s : { visited: { ...s.visited, [v]: true } })),
      setDismissed: (dismissed) => set({ dismissed }),
    }),
    { name: "pacul-judge-guide", storage: createJSONStorage(() => localStorage) }
  )
);
