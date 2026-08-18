"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { estimateCo2FromAvoidedMotorcycleKm, stepsToKm } from "@/config/impact-factors";

export interface StepData {
  steps: number;
  distance: number;
  calories: number;
  /** Estimated kg CO₂e avoided IF the walked distance replaced a motorcycle trip. */
  co2Saved: number;
  isTracking: boolean;
  /** True when steps come from the desktop/demo simulator, not the motion sensor. */
  isSimulated: boolean;
  hasPermission: boolean | null;
  startTime: Date | null;
  duration: number;
}

const INITIAL: StepData = {
  steps: 0,
  distance: 0,
  calories: 0,
  co2Saved: 0,
  isTracking: false,
  isSimulated: false,
  hasPermission: null,
  startTime: null,
  duration: 0,
};

const THRESHOLD = 1.8;        // linear-acceleration peak after removing gravity
const MIN_STEP_INTERVAL = 250; // minimum ms between steps
const GRAVITY_ALPHA = 0.8;     // low-pass filter alpha

export function useStepTracker() {
  const [data, setData] = useState<StepData>(INITIAL);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lastMagnitude = useRef(0);
  const lastPeak = useRef(false);
  const lastStepTime = useRef(0);
  const gravityRef = useRef({ x: 0, y: 0, z: 9.8 });

  const detectStep = useCallback((x: number, y: number, z: number) => {
    /* Low-pass filter to isolate gravity */
    const g = gravityRef.current;
    g.x = GRAVITY_ALPHA * g.x + (1 - GRAVITY_ALPHA) * x;
    g.y = GRAVITY_ALPHA * g.y + (1 - GRAVITY_ALPHA) * y;
    g.z = GRAVITY_ALPHA * g.z + (1 - GRAVITY_ALPHA) * z;

    /* High-pass: linear acceleration without gravity */
    const lx = x - g.x;
    const ly = y - g.y;
    const lz = z - g.z;
    const magnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);

    const now = Date.now();

    /* Peak detection */
    if (
      magnitude > THRESHOLD &&
      !lastPeak.current &&
      now - lastStepTime.current > MIN_STEP_INTERVAL
    ) {
      lastPeak.current = true;
      lastStepTime.current = now;
      setData((prev) => {
        const newSteps = prev.steps + 1;
        return {
          ...prev,
          steps: newSteps,
          distance: Math.round(stepsToKm(newSteps) * 1000),
          calories: Math.round(newSteps * 0.04),
          co2Saved: estimateCo2FromAvoidedMotorcycleKm(stepsToKm(newSteps)),
        };
      });
    } else if (magnitude < THRESHOLD * 0.5) {
      lastPeak.current = false;
    }

    lastMagnitude.current = magnitude;
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (
      typeof window !== "undefined" &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      try {
        const perm = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        return perm === "granted";
      } catch {
        return false;
      }
    }
    return true;
  };

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        detectStep(acc.x, acc.y, acc.z);
      }
    },
    [detectStep]
  );

  const startTracking = async () => {
    const granted = await requestPermission();
    if (!granted) {
      setData((prev) => ({ ...prev, hasPermission: false }));
      return;
    }
    setData((prev) => ({
      ...prev,
      hasPermission: true,
      isTracking: true,
      isSimulated: false,
      startTime: new Date(),
    }));
    window.addEventListener("devicemotion", handleMotion);
  };

  const stopTracking = useCallback(() => {
    window.removeEventListener("devicemotion", handleMotion);
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
    setData((prev) => ({ ...prev, isTracking: false }));
  }, [handleMotion]);

  const startSimulation = useCallback(() => {
    setData((prev) => ({
      ...prev,
      isTracking: true,
      isSimulated: true,
      startTime: new Date(),
      hasPermission: true,
    }));
    simRef.current = setInterval(() => {
      detectStep(
        Math.random() * 14 + 8,
        Math.random() * 3,
        Math.random() * 3
      );
    }, 500 + Math.random() * 400);
  }, [detectStep]);

  const reset = useCallback(() => {
    stopTracking();
    setData(INITIAL);
    lastMagnitude.current = 0;
    lastPeak.current = false;
    lastStepTime.current = 0;
    gravityRef.current = { x: 0, y: 0, z: 9.8 };
  }, [stopTracking]);

  useEffect(() => {
    if (!data.isTracking) return;
    const timer = setInterval(() => {
      setData((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.isTracking]);

  useEffect(() => {
    return () => {
      if (simRef.current) clearInterval(simRef.current);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [handleMotion]);

  return {
    ...data,
    startTracking,
    stopTracking,
    startSimulation,
    reset,
  };
}
