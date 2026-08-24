from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class TransactionOut(BaseModel):
    id: str
    raw_id: str
    timestamp: datetime
    merchant: str
    category: str
    amount: float
    currency: str
    status: str
    payment_method: str
    is_refund: bool
    coins_earned: int

    model_config = ConfigDict(from_attributes=True)


class TransactionSummaryStats(BaseModel):
    total_count: int
    total_spend: float
    success_count: int
    failed_count: int
    pending_count: int
    refund_count: int
    total_coins_generated: int


class PaginatedTransactionsResponse(BaseModel):
    items: List[TransactionOut]
    total: int
    page: int
    page_size: int
    total_pages: int
    stats: Optional[TransactionSummaryStats] = None


class FilterOptionsResponse(BaseModel):
    categories: List[str]
    statuses: List[str]
    payment_methods: List[str]
    min_amount: float
    max_amount: float
    earliest_date: datetime
    latest_date: datetime
