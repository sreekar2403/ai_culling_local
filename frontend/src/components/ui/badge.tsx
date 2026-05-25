"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "accept" | "reject" | "uncertain" | "neutral" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
}

const variants: Record<string, string> = {
  accept: "bg-green-100 text-green-800 border-green-200",
  reject: "bg-red-100 text-red-800 border-red-200",
  uncertain: "bg-yellow-100 text-yellow-800 border-yellow-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  warning: "bg-orange-100 text-orange-800 border-orange-200",
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
