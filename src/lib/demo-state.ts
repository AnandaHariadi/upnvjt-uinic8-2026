"use client";

import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import { useEcoActionStore } from "@/store/ecoAction.store";
import { useVoucherStore } from "@/store/voucher.store";
import { useCollaborationStore } from "@/store/collaboration.store";
import { useWasteReportStore } from "@/store/wasteReport.store";
import { useStepTrackerStore } from "@/store/stepTracker.store";
import { DEMO_USER_ID } from "@/lib/demo-mode";

/**
 * All PACUL prototype state lives in this browser (localStorage). These
 * helpers keep it deterministic for judging and isolated between accounts.
 */

const OWNER_KEY = "pacul-session-owner";

/** Reset every client store. `demo` loads the seeded judge scenario; `empty` gives a fresh account. */
export function resetClientState(mode: "demo" | "empty", userId: string) {
  useEcoPointsStore.getState().reset(mode);
  useGreenActionStore.getState().reset(mode, userId);
  useEcoActionStore.getState().reset(mode);
  useVoucherStore.getState().reset();
  useCollaborationStore.getState().reset();
  useWasteReportStore.getState().reset();
  useStepTrackerStore.getState().reset();
  try {
    localStorage.setItem(OWNER_KEY, userId);
    localStorage.removeItem("pacul-judge-guide");
  } catch {
    /* storage unavailable: state still reset in memory */
  }
}

/**
 * Called after every successful sign-in. The demo account always starts from
 * the same seeded state; other accounts keep their own state unless a
 * different user used this browser before.
 */
export function prepareSessionState(userId: string) {
  if (userId === DEMO_USER_ID) {
    resetClientState("demo", userId);
    return;
  }
  let previous: string | null = null;
  try {
    previous = localStorage.getItem(OWNER_KEY);
  } catch {
    /* ignore */
  }
  if (previous !== userId) resetClientState("empty", userId);
}
