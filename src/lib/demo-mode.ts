/**
 * Local demo mode: no backend required. All accounts and activity are kept in
 * this browser's localStorage. Set NEXT_PUBLIC_DEMO_MODE=false to call a real
 * REST API at NEXT_PUBLIC_API_URL instead (not included in this repository).
 */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Stable id of the built-in demo account. */
export const DEMO_USER_ID = "demo";

/** Demo account for evaluation purposes only: not a real credential. */
export const DEMO_ACCOUNT = { email: "demo@pacul.app", password: "Demo1234!" } as const;

/** Demo government account for evaluation purposes only. */
export const DEMO_GOV_ACCOUNT = { email: "gov-demo@pacul.app", password: "GovDemo1234!" } as const;

export function demoDelay(ms = 350): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
