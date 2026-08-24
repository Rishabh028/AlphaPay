"use client";

import React, { useState } from "react";
import { History, Gift, Copy, Check, Calendar, Coins } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { formatCoins, formatDateTime } from "@/lib/utils";
import { RedemptionHistoryItem } from "@/types";

interface RedemptionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: RedemptionHistoryItem[];
  isLoading?: boolean;
}

export function RedemptionHistoryModal({
  isOpen,
  onClose,
  history,
  isLoading = false,
}: RedemptionHistoryModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voucher Redemption History"
      description="All past rewards redeemed with your coin balance"
      maxWidth="lg"
      footer={
        <Button variant="outline" size="md" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Loading redemption history...
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Gift className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">No Redemptions Yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't redeemed any rewards yet. Spend on credit cards to earn coins!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-100">{item.reward_title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {formatDateTime(item.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <Coins className="h-3.5 w-3.5" />
                    {formatCoins(item.coins_spent)} Coins
                  </span>
                </div>
              </div>

              {/* Voucher Code Box */}
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="font-mono text-xs font-semibold text-amber-300">
                  {item.voucher_code}
                </span>
                <button
                  onClick={() => handleCopy(item.voucher_code)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Copy Voucher Code"
                >
                  {copiedCode === item.voucher_code ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
