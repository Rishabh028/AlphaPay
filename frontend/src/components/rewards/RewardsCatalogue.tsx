"use client";

import React, { useState } from "react";
import { Gift, Coins, Sparkles, History, ShieldCheck } from "lucide-react";
import { RewardCard } from "./RewardCard";
import { RedeemConfirmModal } from "./RedeemConfirmModal";
import { Button } from "../ui/Button";
import { formatCoins } from "@/lib/utils";
import { Reward, CoinBalance, RedeemResponse } from "@/types";

interface RewardsCatalogueProps {
  rewards: Reward[];
  coinBalance: CoinBalance | null;
  onRedeemReward: (rewardId: string) => Promise<RedeemResponse>;
  onOpenHistory?: () => void;
  isLoading?: boolean;
}

export function RewardsCatalogue({
  rewards,
  coinBalance,
  onRedeemReward,
  onOpenHistory,
  isLoading = false,
}: RewardsCatalogueProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const userBalance = coinBalance?.available_balance ?? 0;

  // Filter rewards by category
  const categories = ["all", ...Array.from(new Set(rewards.map((r) => r.category)))];
  const filteredRewards =
    activeCategory === "all"
      ? rewards
      : rewards.filter((r) => r.category === activeCategory);

  const handleConfirmRedeem = async (reward: Reward): Promise<RedeemResponse> => {
    setIsRedeeming(true);
    try {
      const res = await onRedeemReward(reward.id);
      return res;
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div id="rewards-section" className="space-y-6">
      {/* Rewards Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Exclusive Member Rewards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Redeem Your Reward Coins
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Earn 1 Coin per ₹100 spent on successful credit card transactions.
              Instantly exchange your coins for shopping vouchers, flight passes, and cash cards.
            </p>
          </div>

          {/* Balance Widget */}
          <div className="rounded-2xl bg-slate-950/90 border border-amber-500/30 p-5 flex flex-col items-center justify-center text-center shadow-xl min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Available Balance
            </span>
            <div className="text-3xl font-black text-amber-300 font-mono my-1">
              {formatCoins(userBalance)}
            </div>
            <span className="text-xs text-slate-400">Coins Ready to Spend</span>

            {onOpenHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenHistory}
                leftIcon={<History className="h-3.5 w-3.5" />}
                className="mt-3 w-full text-xs"
              >
                Voucher History
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/[0.06]"
              }`}
            >
              {cat === "all" ? "All Rewards" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid (4-6 Items) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-64 rounded-2xl bg-slate-900/60 border border-white/[0.05] animate-pulse"
            />
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-400 bg-slate-900/40 rounded-2xl border border-white/[0.06]">
          No rewards found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userBalance={userBalance}
              onRedeem={(r) => setSelectedReward(r)}
            />
          ))}
        </div>
      )}

      {/* Redeem Confirmation Modal */}
      <RedeemConfirmModal
        reward={selectedReward}
        isOpen={Boolean(selectedReward)}
        onClose={() => setSelectedReward(null)}
        userBalance={userBalance}
        onConfirmRedeem={handleConfirmRedeem}
        isLoading={isRedeeming}
      />
    </div>
  );
}
