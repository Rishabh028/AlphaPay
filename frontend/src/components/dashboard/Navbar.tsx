"use client";

import React from "react";
import { Coins, CreditCard, Sparkles, Gift, ArrowUpRight } from "lucide-react";
import { formatCoins } from "@/lib/utils";
import { CoinBalance } from "@/types";

interface NavbarProps {
  coinBalance?: CoinBalance | null;
  onOpenRewards: () => void;
  onOpenHistory?: () => void;
}

export function Navbar({ coinBalance, onOpenRewards, onOpenHistory }: NavbarProps) {
  const balance = coinBalance?.available_balance ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                Alpha<span className="text-indigo-400">Pay</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                PROD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Credit Cards & Rewards Engine
            </p>
          </div>
        </div>

        {/* Right: Coin Balance Badge & Rewards Action */}
        <div className="flex items-center gap-3">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors hidden sm:block"
            >
              Voucher History
            </button>
          )}

          {/* Reward Coin Balance Pill */}
          <button
            onClick={onOpenRewards}
            className="group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="View Rewards Catalogue"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/40">
              <Coins className="h-3.5 w-3.5 text-slate-950" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80">
                Reward Coins
              </span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">
                {formatCoins(balance)}
              </span>
            </div>
            <div className="ml-1 pl-2 border-l border-amber-500/20 flex items-center text-amber-400 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
              <Gift className="h-3.5 w-3.5 mr-1" />
              <span className="hidden md:inline">Redeem</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
