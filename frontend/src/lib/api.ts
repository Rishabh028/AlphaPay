import {
  PaginatedTransactionsResponse,
  Transaction,
  FilterOptions,
  CategorySpendResponse,
  MonthlyTrendResponse,
  AnalyticsOverview,
  Reward,
  CoinBalance,
  RedeemResponse,
  RedemptionHistoryResponse,
  FilterState,
} from "@/types";

function getApiBase(): string {
  let base = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").trim();
  base = base.replace(/\/+$/, "");
  if (!base.endsWith("/api/v1")) {
    base = `${base}/api/v1`;
  }
  return base;
}

const API_BASE = getApiBase();

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  async getTransactions(filters: Partial<FilterState>): Promise<PaginatedTransactionsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", filters.page.toString());
    if (filters.pageSize) params.set("page_size", filters.pageSize.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.category && filters.category !== "all") params.set("category", filters.category);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.paymentMethod && filters.paymentMethod !== "all") params.set("payment_method", filters.paymentMethod);
    if (filters.minAmount !== undefined && filters.minAmount !== null) params.set("min_amount", filters.minAmount.toString());
    if (filters.maxAmount !== undefined && filters.maxAmount !== null) params.set("max_amount", filters.maxAmount.toString());
    if (filters.startDate) params.set("start_date", filters.startDate);
    if (filters.endDate) params.set("end_date", filters.endDate);
    if (filters.sortBy) params.set("sort_by", filters.sortBy);
    if (filters.sortOrder) params.set("sort_order", filters.sortOrder);

    return fetchJSON<PaginatedTransactionsResponse>(`${API_BASE}/transactions?${params.toString()}`);
  },

  async getFilterOptions(): Promise<FilterOptions> {
    return fetchJSON<FilterOptions>(`${API_BASE}/transactions/filters`);
  },

  async getTransactionById(id: string): Promise<Transaction> {
    return fetchJSON<Transaction>(`${API_BASE}/transactions/${id}`);
  },

  async getCategorySpend(status: string = "SUCCESS", startDate?: string, endDate?: string): Promise<CategorySpendResponse> {
    const params = new URLSearchParams({ status });
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    return fetchJSON<CategorySpendResponse>(`${API_BASE}/analytics/spend-by-category?${params.toString()}`);
  },

  async getMonthlyTrend(category?: string, startDate?: string, endDate?: string): Promise<MonthlyTrendResponse> {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    return fetchJSON<MonthlyTrendResponse>(`${API_BASE}/analytics/monthly-trend?${params.toString()}`);
  },

  async getOverviewStats(): Promise<AnalyticsOverview> {
    return fetchJSON<AnalyticsOverview>(`${API_BASE}/analytics/overview`);
  },

  async getCoinBalance(): Promise<CoinBalance> {
    return fetchJSON<CoinBalance>(`${API_BASE}/rewards/balance`);
  },

  async getRewardsCatalogue(): Promise<Reward[]> {
    return fetchJSON<Reward[]>(`${API_BASE}/rewards/catalogue`);
  },

  async redeemReward(rewardId: string): Promise<RedeemResponse> {
    return fetchJSON<RedeemResponse>(`${API_BASE}/rewards/redeem`, {
      method: "POST",
      body: JSON.stringify({ reward_id: rewardId }),
    });
  },

  async getRedemptionHistory(): Promise<RedemptionHistoryResponse> {
    return fetchJSON<RedemptionHistoryResponse>(`${API_BASE}/rewards/history`);
  },
};
