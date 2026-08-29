"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  cta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}
    >
      {/* Icon or emoji */}
      {emoji ? (
        <span className="text-4xl">{emoji}</span>
      ) : Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
          <Icon size={26} className="text-gray-400" />
        </div>
      ) : null}

      <div>
        <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
        {description && (
          <p className="mt-1 max-w-xs text-xs text-gray-500">{description}</p>
        )}
      </div>

      {cta && (
        <button
          onClick={cta.onClick}
          className="mt-1 rounded-md bg-[#2D5F3F] px-4 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
