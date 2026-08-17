"use client";

import { useEffect, useState } from "react";

/**
 * True after the first client render. Persisted Zustand stores read
 * localStorage, so values can differ from the server render; gate them on
 * this to avoid hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
