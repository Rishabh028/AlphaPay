import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "warning" | "info" | "gold" | "neutral";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  dot = true,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-sm shadow-emerald-500/10",
    danger:
      "bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-sm shadow-rose-500/10",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-sm shadow-amber-500/10",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-sm shadow-indigo-500/10",
    gold: "bg-amber-400/15 text-amber-300 border-amber-400/30 shadow-sm shadow-amber-400/20 font-semibold",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const dotColors = {
    success: "bg-emerald-400",
    danger: "bg-rose-400",
    warning: "bg-amber-400",
    info: "bg-indigo-400",
    gold: "bg-amber-400 animate-pulse",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full inline-block", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
