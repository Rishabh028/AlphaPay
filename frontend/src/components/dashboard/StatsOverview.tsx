"use client";

import React from "react";
import { TrendingUp, Coins, CheckCircle2, ShoppingBag, ArrowUpRight } from "lucide-react";
import { formatINR, formatCoins } from "@/lib/utils";
import { TransactionSummaryStats } from "@/types";

interface StatsOverviewProps {
  stats?: TransactionSummaryStats;
  totalFilteredCount?: number;
}

export function StatsOverview({ stats, totalFilteredCount }: StatsOverviewProps) {
  const totalSpend = stats?.total_spend ?? 0;
  const successCount = stats?.success_count ?? 0;
  const totalCount = stats?.total_count ?? (totalFilteredCount || 0);
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "100.0";
  const coinsGenerated = stats?.total_coins_generated ?? 0;
  const avgTicket = totalCount > 0 ? totalSpend / totalCount : 0;

  const statCards = [
    {
      title: "Total Filtered Spend",
      value: formatINR(totalSpend),
      subtext: `${totalCount.toLocaleString()} transactions analyzed`,
      icon: <TrendingUp className="h-5 w-5 text-indigo-400" />,
      glowColor: "from-indigo-500/10 to-transparent",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Payment Success Rate",
      value: `${successRate}%`,
      subtext: `${successCount.toLocaleString()} successful / ${stats?.failed_count ?? 0} failed`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      glowColor: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Reward Coins Generated",
      value: formatCoins(coinsGenerated),
      subtext: "1 coin per ₹100 spent (capped)",
      icon: <Coins className="h-5 w-5 text-amber-400" />,
      glowColor: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Average Ticket Size",
      value: formatINR(avgTicket),
      subtext: `${stats?.refund_count ?? 0} refunds / reversals tracked`,
      icon: <ShoppingBag className="h-5 w-5 text-cyan-400" />,
      glowColor: "from-cyan-500/10 to-transparent",
      borderColor: "border-cyan-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${card.glowColor} bg-slate-900/80 border ${card.borderColor} p-5 backdrop-blur-md shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-white/[0.05]">
              {card.icon}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
              {card.value}
            </div>
            <p className="mt-1 text-xs text-slate-400 font-medium">{card.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
