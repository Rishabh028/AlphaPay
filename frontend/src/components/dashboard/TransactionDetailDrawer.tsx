"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  CreditCard,
  Calendar,
  Coins,
  Tag,
  AlertTriangle,
  Code,
  ShieldCheck,
  Clock,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Drawer } from "../ui/Drawer";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { formatINR, formatDateTime, formatCoins } from "@/lib/utils";
import { Transaction } from "@/types";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailDrawer({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailDrawerProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!transaction) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.raw_id || transaction.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const statusVariant =
    transaction.status === "SUCCESS"
      ? "success"
      : transaction.status === "FAILED"
      ? "danger"
      : "warning";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      description="Complete audit log and coin reward breakdown"
      footer={
        <Button variant="outline" size="md" onClick={onClose}>
          Close Details
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Merchant & Amount Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 text-center shadow-lg relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">{transaction.merchant}</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge variant="neutral" dot={false}>
              <Tag className="h-3 w-3 mr-1" />
              {transaction.category}
            </Badge>
            <Badge variant={statusVariant}>{transaction.status}</Badge>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Transaction Amount
            </span>
            <div
              className={`text-3xl font-extrabold font-mono ${
                transaction.amount < 0 ? "text-rose-400" : "text-slate-100"
              }`}
            >
              {formatINR(transaction.amount)}
            </div>
            {transaction.is_refund && (
              <p className="text-xs text-rose-400 mt-1 flex items-center justify-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Marked as Refund / Reversal
              </p>
            )}
          </div>
        </div>

        {/* Reward Coins Highlight Card */}
        {transaction.status === "SUCCESS" && transaction.coins_earned > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">
                  Reward Coins Earned
                </span>
                <p className="text-base font-extrabold text-amber-300 font-mono">
                  +{formatCoins(transaction.coins_earned)} Coins
                </p>
              </div>
            </div>
            <span className="text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              1 Coin / ₹100
            </span>
          </div>
        )}

        {/* Key Metadata Table */}
        <div className="rounded-xl bg-slate-900/60 border border-white/[0.06] divide-y divide-white/[0.06]">
          <div className="flex items-center justify-between p-3.5 text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-500" />
              Raw Transaction ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                {transaction.raw_id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy Transaction ID"
              >
                {copiedId ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Timestamp
            </span>
            <span className="text-slate-200 font-medium">
              {formatDateTime(transaction.timestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-500" />
              Payment Method
            </span>
            <span className="text-slate-200 font-medium">{transaction.payment_method}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              Currency
            </span>
            <span className="text-slate-200 font-mono font-medium">
              {transaction.currency}
            </span>
          </div>
        </div>

        {/* Raw JSON Debug Viewer */}
        <div className="border-t border-white/[0.08] pt-4">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Developer Audit (Raw JSON)
            </span>
            <span>{showJson ? "Hide" : "Show"}</span>
          </button>

          {showJson && (
            <pre className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </Drawer>
  );
}
