"use client";

import React from "react";
import {
  CreditCard,
  Building2,
  Calendar,
  Tag,
  Coins,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { Table, Column } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { formatINR, formatDateTime, formatCoins } from "@/lib/utils";
import { Transaction, SortField, SortOrder } from "@/types";

interface TransactionTableProps {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TransactionTable({
  transactions,
  total,
  page,
  pageSize,
  totalPages,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectTransaction,
  onResetFilters,
  isLoading = false,
  error = null,
  onRetry,
}: TransactionTableProps) {
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  // Table Columns Definition
  const columns: Column<Transaction>[] = [
    {
      key: "raw_id",
      header: "TXN ID",
      width: "140px",
      render: (item) => (
        <span className="font-mono text-xs text-slate-300 bg-slate-950/60 px-2 py-1 rounded border border-white/[0.05]">
          {item.raw_id}
        </span>
      ),
    },
    {
      key: "timestamp",
      header: "Date & Time",
      sortable: true,
      width: "180px",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-slate-200 text-xs font-medium whitespace-nowrap">
            {formatDateTime(item.timestamp)}
          </span>
        </div>
      ),
    },
    {
      key: "merchant",
      header: "Merchant",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/[0.06] flex items-center justify-center text-slate-300 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-100 text-sm whitespace-nowrap">
              {item.merchant}
            </div>
            <div className="text-[11px] text-slate-400">{item.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: "payment_method",
      header: "Payment Method",
      width: "150px",
      render: (item) => (
        <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
          {item.payment_method}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (item) => {
        const variant =
          item.status === "SUCCESS"
            ? "success"
            : item.status === "FAILED"
            ? "danger"
            : "warning";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      width: "150px",
      render: (item) => (
        <div className="text-right">
          <span
            className={`font-mono text-sm font-extrabold whitespace-nowrap ${
              item.amount < 0 ? "text-rose-400" : "text-slate-100"
            }`}
          >
            {formatINR(item.amount)}
          </span>
        </div>
      ),
    },
    {
      key: "coins_earned",
      header: "Coins",
      align: "right",
      width: "110px",
      render: (item) => (
        <div className="text-right">
          {item.status === "SUCCESS" && item.coins_earned > 0 ? (
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              <Coins className="h-3 w-3 text-amber-400" />
              +{formatCoins(item.coins_earned)}
            </span>
          ) : (
            <span className="text-xs text-slate-600 font-mono">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hand-Built Custom Table Container */}
      <Table<Transaction>
        columns={columns}
        data={transactions}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => onSelectTransaction(item)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => onSort(key as SortField)}
        isLoading={isLoading}
        loadingRowCount={pageSize > 15 ? 15 : pageSize}
        emptyTitle="No matching transactions found"
        emptyDescription="Try clearing some of your filters or searching for another merchant."
        onResetFilters={onResetFilters}
        error={error}
        onRetry={onRetry}
      />

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-md">
        {/* Left: Summary text & Page size selector */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{startIdx.toLocaleString()}</strong> to{" "}
            <strong className="text-slate-200">{endIdx.toLocaleString()}</strong> of{" "}
            <strong className="text-slate-200">{total.toLocaleString()}</strong> rows
          </span>

          <div className="flex items-center gap-1.5 pl-3 border-l border-white/[0.08]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(1)}
            title="First Page"
            className="px-2"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            title="Previous Page"
            className="px-2.5"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* Current Page Display */}
          <span className="px-3 py-1 text-xs font-semibold text-slate-200 bg-slate-950 rounded-lg border border-white/[0.08]">
            Page {page} of {Math.max(1, totalPages)}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            title="Next Page"
            className="px-2.5"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(totalPages)}
            title="Last Page"
            className="px-2"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
