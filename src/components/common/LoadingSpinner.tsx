"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export default function LoadingSpinner({
  size = 24,
  className = "",
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label ?? "Loading…"}
    >
      <Loader2
        size={size}
        className="animate-spin text-[#2D5F3F]"
        aria-hidden="true"
      />
      {label && (
        <p className="text-xs text-gray-500">{label}</p>
      )}
    </div>
  );
}
