import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500",
            "transition-all duration-200 outline-none",
            "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            "hover:border-slate-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
