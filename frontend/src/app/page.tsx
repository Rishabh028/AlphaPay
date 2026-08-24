"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TransactionFilters } from "@/components/dashboard/TransactionFilters";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { TransactionDetailDrawer } from "@/components/dashboard/TransactionDetailDrawer";
import { CategorySpendChart } from "@/components/dashboard/CategorySpendChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { RewardsCatalogue } from "@/components/rewards/RewardsCatalogue";
import { RedemptionHistoryModal } from "@/components/rewards/RedemptionHistoryModal";
import { api } from "@/lib/api";
import {
  Transaction,
  FilterState,
  FilterOptions,
  CategorySpendResponse,
  MonthlyTrendResponse,
  Reward,
  CoinBalance,
  RedeemResponse,
  RedemptionHistoryItem,
  SortField,
  SortOrder,
  TransactionSummaryStats,
} from "@/types";

export default function DashboardPage() {
  // 1. Core State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    status: "all",
    paymentMethod: "all",
    minAmount: undefined,
    maxAmount: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: "timestamp",
    sortOrder: "desc",
    page: 1,
    pageSize: 25,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [summaryStats, setSummaryStats] = useState<TransactionSummaryStats | undefined>(undefined);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  const [categorySpend, setCategorySpend] = useState<CategorySpendResponse | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendResponse | null>(null);
  const [coinBalance, setCoinBalance] = useState<CoinBalance | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistoryItem[]>([]);

  // 2. Modals & Drawers
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 3. Loading & Error States
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const [txnError, setTxnError] = useState<string | null>(null);

  // Fetch Filter Options once on load
  useEffect(() => {
    async function loadMetadata() {
      try {
        const opts = await api.getFilterOptions();
        setFilterOptions(opts);
      } catch (err) {
        console.warn("Could not load filter metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch Transactions when filters change
  const loadTransactions = useCallback(async () => {
    setIsLoadingTxns(true);
    setTxnError(null);
    try {
      const res = await api.getTransactions(filters);
      setTransactions(res.items);
      setTotalTransactions(res.total);
      setTotalPages(res.total_pages);
      setSummaryStats(res.stats);
    } catch (err: any) {
      setTxnError(err.message || "Failed to load transactions.");
    } finally {
      setIsLoadingTxns(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Fetch Spend Analytics
  const loadAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const [catRes, monthRes] = await Promise.all([
        api.getCategorySpend("SUCCESS", filters.startDate, filters.endDate),
        api.getMonthlyTrend(
          filters.category !== "all" ? filters.category : undefined,
          filters.startDate,
          filters.endDate
        ),
      ]);
      setCategorySpend(catRes);
      setMonthlyTrend(monthRes);
    } catch (err) {
      console.warn("Could not load spend analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [filters.category, filters.startDate, filters.endDate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Fetch Rewards & Balance
  const loadRewardsData = useCallback(async () => {
    setIsLoadingRewards(true);
    try {
      const [bal, catList, hist] = await Promise.all([
        api.getCoinBalance(),
        api.getRewardsCatalogue(),
        api.getRedemptionHistory(),
      ]);
      setCoinBalance(bal);
      setRewards(catList);
      setRedemptionHistory(hist.redemptions);
    } catch (err) {
      console.warn("Could not load rewards data:", err);
    } finally {
      setIsLoadingRewards(false);
    }
  }, []);

  useEffect(() => {
    loadRewardsData();
  }, [loadRewardsData]);

  // Handle Filter Changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      paymentMethod: "all",
      minAmount: undefined,
      maxAmount: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "timestamp",
      sortOrder: "desc",
      page: 1,
      pageSize: 25,
    });
  };

  // Cross-Filtering: Category slice clicked
  const handleCategorySelect = (category: string) => {
    handleFilterChange({ category, page: 1 });
  };

  // Cross-Filtering: Month bar clicked
  const handleMonthSelect = (monthKey: string) => {
    // monthKey: "2025-07"
    const [year, month] = monthKey.split("-");
    const startDate = `${year}-${month}-01T00:00:00Z`;
    // Last day of month
    const nextMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 0));
    const lastDay = nextMonth.getUTCDate();
    const endDate = `${year}-${month}-${lastDay < 10 ? `0${lastDay}` : lastDay}T23:59:59Z`;

    handleFilterChange({ startDate, endDate, page: 1 });
  };

  // Optimistic Reward Redemption with Rollback
  const handleRedeemReward = async (rewardId: string): Promise<RedeemResponse> => {
    const targetReward = rewards.find((r) => r.id === rewardId);
    if (!targetReward) throw new Error("Reward not found.");

    const previousBalance = coinBalance;

    // 1. Optimistic Update: Deduct balance immediately in UI
    if (previousBalance) {
      setCoinBalance({
        ...previousBalance,
        available_balance: Math.max(
          0,
          previousBalance.available_balance - targetReward.cost_coins
        ),
        total_redeemed_coins:
          previousBalance.total_redeemed_coins + targetReward.cost_coins,
      });
    }

    try {
      // 2. Call backend API
      const res = await api.redeemReward(rewardId);

      // 3. Confirm with server response
      if (previousBalance) {
        setCoinBalance({
          ...previousBalance,
          available_balance: res.remaining_balance,
          total_redeemed_coins:
            previousBalance.total_redeemed_coins + res.coins_spent,
        });
      }

      // Add to history
      setRedemptionHistory((prev) => [
        {
          id: res.redemption_id,
          reward_id: res.reward_id,
          reward_title: res.reward_title,
          coins_spent: res.coins_spent,
          voucher_code: res.voucher_code,
          status: "COMPLETED",
          created_at: res.redeemed_at,
        },
        ...prev,
      ]);

      return res;
    } catch (err: any) {
      // 4. Clean Rollback on Failure: Restore previous balance
      setCoinBalance(previousBalance);
      throw err;
    }
  };

  const scrollToRewards = () => {
    const el = document.getElementById("rewards-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation Bar with Glowing Coin Balance */}
      <Navbar
        coinBalance={coinBalance}
        onOpenRewards={scrollToRewards}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Transactions & Spend Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Explore 10,000+ credit transactions, interactive spend trends, and coin rewards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              10,000 Transactions Ingested
            </span>
          </div>
        </div>

        {/* High-Level Metric Stat Cards */}
        <StatsOverview
          stats={summaryStats}
          totalFilteredCount={totalTransactions}
        />

        {/* Spend Analytics Visualizations (Two-Way Interactive Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategorySpendChart
            data={categorySpend}
            selectedCategory={filters.category}
            onSelectCategory={handleCategorySelect}
            isLoading={isLoadingAnalytics}
          />

          <MonthlyTrendChart
            data={monthlyTrend}
            selectedMonth={filters.startDate ? filters.startDate.slice(0, 7) : undefined}
            onSelectMonth={handleMonthSelect}
            isLoading={isLoadingAnalytics}
          />
        </div>

        {/* Transactions Section: Multi-Filter Bar & Hand-Built Table */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Transaction History
            </h2>
            <span className="text-xs text-slate-400">
              Click any row to inspect complete receipt details
            </span>
          </div>

          {/* Combinable Filters Bar */}
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            filterOptions={filterOptions}
            totalFilteredCount={totalTransactions}
          />

          {/* Custom Hand-Built Data Table */}
          <TransactionTable
            transactions={transactions}
            total={totalTransactions}
            page={filters.page}
            pageSize={filters.pageSize}
            totalPages={totalPages}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={(field) => {
              if (filters.sortBy === field) {
                handleFilterChange({
                  sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                  page: 1,
                });
              } else {
                handleFilterChange({ sortBy: field, sortOrder: "desc", page: 1 });
              }
            }}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(pageSize) => handleFilterChange({ pageSize, page: 1 })}
            onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            onResetFilters={handleResetFilters}
            isLoading={isLoadingTxns}
            error={txnError}
            onRetry={loadTransactions}
          />
        </div>

        {/* Rewards Section with Live Balance & Catalogue */}
        <div className="pt-8 border-t border-white/[0.08]">
          <RewardsCatalogue
            rewards={rewards}
            coinBalance={coinBalance}
            onRedeemReward={handleRedeemReward}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            isLoading={isLoadingRewards}
          />
        </div>
      </main>

      {/* Transaction Detail Slide-Over Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Redemption History Modal */}
      <RedemptionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={redemptionHistory}
      />
    </div>
  );
}
