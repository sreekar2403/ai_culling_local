"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "neutral";
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  className,
  variant = "default",
  showLabel = false,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors: Record<string, string> = {
    default: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    neutral: "bg-gray-400",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            variantColors[variant]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 min-w-[3ch] text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
