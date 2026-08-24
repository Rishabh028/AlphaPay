export interface Transaction {
  id: string;
  raw_id: string;
  timestamp: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  payment_method: string;
  is_refund: boolean;
  coins_earned: number;
}

export interface TransactionSummaryStats {
  total_count: number;
  total_spend: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  refund_count: number;
  total_coins_generated: number;
}

export interface PaginatedTransactionsResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats?: TransactionSummaryStats;
}

export interface FilterOptions {
  categories: string[];
  statuses: string[];
  payment_methods: string[];
  min_amount: number;
  max_amount: number;
  earliest_date: string;
  latest_date: string;
}

export interface CategorySpendItem {
  category: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  color_hint?: string;
}

export interface CategorySpendResponse {
  total_spend: number;
  categories: CategorySpendItem[];
}

export interface MonthlyTrendItem {
  month_key: string;
  month_label: string;
  total_spend: number;
  transaction_count: number;
  success_count: number;
  failed_count: number;
  coins_earned: number;
}

export interface MonthlyTrendResponse {
  total_spend: number;
  months: MonthlyTrendItem[];
}

export interface AnalyticsOverview {
  total_spend: number;
  total_transactions: number;
  avg_transaction_value: number;
  top_category: string;
  top_merchant: string;
  total_coins_earned: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  category: string;
  cost_coins: number;
  discount_value: number;
  discount_display: string;
  icon_key: string;
  brand_name: string;
  stock: number;
  is_active: boolean;
}

export interface CoinBalance {
  total_earned_coins: number;
  total_redeemed_coins: number;
  available_balance: number;
  lifetime_spend_eligible: number;
}

export interface RedeemResponse {
  success: boolean;
  message: string;
  redemption_id: string;
  voucher_code: string;
  reward_id: string;
  reward_title: string;
  coins_spent: number;
  remaining_balance: number;
  redeemed_at: string;
}

export interface RedemptionHistoryItem {
  id: string;
  reward_id: string;
  reward_title: string;
  coins_spent: number;
  voucher_code: string;
  status: string;
  created_at: string;
}

export interface RedemptionHistoryResponse {
  redemptions: RedemptionHistoryItem[];
  total: number;
}

export type SortField = "timestamp" | "amount" | "merchant" | "category";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  search: string;
  category: string;
  status: string;
  paymentMethod: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}
