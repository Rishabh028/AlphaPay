from typing import List, Optional
from pydantic import BaseModel


class CategorySpendItem(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage: float
    color_hint: Optional[str] = None


class CategorySpendResponse(BaseModel):
    total_spend: float
    categories: List[CategorySpendItem]


class MonthlyTrendItem(BaseModel):
    month_key: str        # e.g. "2025-07"
    month_label: str      # e.g. "Jul 2025"
    total_spend: float
    transaction_count: int
    success_count: int
    failed_count: int
    coins_earned: int


class MonthlyTrendResponse(BaseModel):
    total_spend: float
    months: List[MonthlyTrendItem]


class AnalyticsOverviewResponse(BaseModel):
    total_spend: float
    total_transactions: int
    avg_transaction_value: float
    top_category: str
    top_merchant: str
    total_coins_earned: int
