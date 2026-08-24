"use client";

import React, { useState } from "react";
import {
  Coins,
  Gift,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { formatCoins, formatINR } from "@/lib/utils";
import { Reward, RedeemResponse } from "@/types";

interface RedeemConfirmModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onConfirmRedeem: (reward: Reward) => Promise<RedeemResponse | void>;
  isLoading?: boolean;
}

export function RedeemConfirmModal({
  reward,
  isOpen,
  onClose,
  userBalance,
  onConfirmRedeem,
  isLoading = false,
}: RedeemConfirmModalProps) {
  const [successResult, setSuccessResult] = useState<RedeemResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  if (!reward) return null;

  const remainingBalance = userBalance - reward.cost_coins;
  const isAffordable = remainingBalance >= 0;

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      const res = await onConfirmRedeem(reward);
      if (res && res.success) {
        setSuccessResult(res);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to redeem reward. Balance has been restored.");
    }
  };

  const handleModalClose = () => {
    setSuccessResult(null);
    setErrorMessage(null);
    setCopiedVoucher(false);
    onClose();
  };

  const handleCopyVoucher = () => {
    if (successResult?.voucher_code) {
      navigator.clipboard.writeText(successResult.voucher_code);
      setCopiedVoucher(true);
      setTimeout(() => setCopiedVoucher(false), 2000);
    }
  };

  // SUCCESS STATE VIEW
  if (successResult) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        title="Redemption Successful!"
        maxWidth="md"
        footer={
          <Button variant="primary" size="md" onClick={handleModalClose}>
            Done & View Balance
          </Button>
        }
      >
        <div className="space-y-6 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-100">
              {successResult.reward_title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your e-voucher has been generated and added to your ledger.
            </p>
          </div>

          {/* Voucher Code Box */}
          <div className="rounded-xl bg-slate-950 border border-amber-500/30 p-4 shadow-inner">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block mb-2">
              Your Unique Voucher Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xl font-extrabold tracking-widest text-slate-100 selection:bg-amber-500">
                {successResult.voucher_code}
              </span>
              <button
                onClick={handleCopyVoucher}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Copy Voucher Code"
              >
                {copiedVoucher ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remaining Balance Summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-white/[0.06] text-xs">
            <span className="text-slate-400">Coins Deducted:</span>
            <span className="text-amber-400 font-mono font-bold">
              -{formatCoins(successResult.coins_spent)} Coins
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-white/[0.06] text-xs">
            <span className="text-slate-400">Updated Available Balance:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {formatCoins(successResult.remaining_balance)} Coins
            </span>
          </div>
        </div>
      </Modal>
    );
  }

  // CONFIRMATION VIEW
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Confirm Reward Redemption"
      description="Review coin deduction details before proceeding"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={handleModalClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!isAffordable || isLoading}
          >
            Confirm & Redeem
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-semibold block">Redemption Failed</span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Reward Summary Card */}
        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">{reward.title}</h4>
            <p className="text-xs text-indigo-400 font-medium">{reward.discount_display}</p>
            <p className="text-xs text-slate-400 mt-0.5">{reward.description}</p>
          </div>
        </div>

        {/* Coin Math Ledger */}
        <div className="rounded-xl bg-slate-950/80 border border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Current Coin Balance</span>
            <span className="font-mono font-bold text-slate-200">
              {formatCoins(userBalance)} Coins
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Redemption Cost</span>
            <span className="font-mono font-bold text-amber-400">
              -{formatCoins(reward.cost_coins)} Coins
            </span>
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-300">Balance After Redemption</span>
            <span
              className={`font-mono font-extrabold ${
                isAffordable ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCoins(remainingBalance)} Coins
            </span>
          </div>
        </div>

        {!isAffordable && (
          <p className="text-xs text-rose-400 text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> You do not have enough coins for this reward.
          </p>
        )}
      </div>
    </Modal>
  );
}
