"use client";

import React from "react";
import { Coins, Sparkles, ShoppingBag, Utensils, Plane, Music, Fuel, Gift } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatCoins, formatINR } from "@/lib/utils";
import { Reward } from "@/types";

interface RewardCardProps {
  reward: Reward;
  userBalance: number;
  onRedeem: (reward: Reward) => void;
  isLoading?: boolean;
}

const BRAND_ICONS: Record<string, React.ReactNode> = {
  "shopping-bag": <ShoppingBag className="h-5 w-5" />,
  utensils: <Utensils className="h-5 w-5" />,
  plane: <Plane className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  fuel: <Fuel className="h-5 w-5" />,
  gift: <Gift className="h-5 w-5" />,
};

export function RewardCard({
  reward,
  userBalance,
  onRedeem,
  isLoading = false,
}: RewardCardProps) {
  const isAffordable = userBalance >= reward.cost_coins;
  const isOutOfStock = reward.stock <= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-white/[0.08] hover:border-amber-500/30 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:translate-y-[-3px] flex flex-col justify-between group">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all pointer-events-none" />

      <div>
        {/* Top: Brand icon & Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            {BRAND_ICONS[reward.icon_key] || <Gift className="h-5 w-5" />}
          </div>
          <Badge variant="gold" dot={false}>
            {reward.category}
          </Badge>
        </div>

        {/* Title & Brand */}
        <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
          {reward.title}
        </h4>
        <p className="text-xs font-semibold text-indigo-400 mt-0.5">
          {reward.discount_display}
        </p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
          {reward.description}
        </p>
      </div>

      {/* Bottom: Cost in Coins & Action Button */}
      <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Coins className="h-3 w-3" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-amber-300 font-mono">
              {formatCoins(reward.cost_coins)}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">Coins</span>
          </div>
        </div>

        <Button
          variant={isAffordable ? "gold" : "outline"}
          size="sm"
          disabled={!isAffordable || isOutOfStock || isLoading}
          onClick={() => onRedeem(reward)}
          className={!isAffordable ? "opacity-60 text-xs" : "text-xs font-semibold"}
        >
          {isOutOfStock ? "Out of Stock" : isAffordable ? "Redeem" : "Need Coins"}
        </Button>
      </div>
    </div>
  );
}
