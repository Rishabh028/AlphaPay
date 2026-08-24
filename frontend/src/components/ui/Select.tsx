import React, { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 pr-9 text-sm text-slate-100",
            "transition-all duration-200 outline-none cursor-pointer",
            "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            "hover:border-slate-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-rose-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
