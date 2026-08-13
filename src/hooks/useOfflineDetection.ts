"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function useOfflineDetection() {
  useEffect(() => {
    const handleOffline = () => {
      toast.error("You are offline. Verification, OCR and map tiles need a connection.", {
        id: "offline-toast",
        duration: Infinity,
      });
    };

    const handleOnline = () => {
      toast.dismiss("offline-toast");
      toast.success("Back online");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
