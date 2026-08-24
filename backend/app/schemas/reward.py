from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class RewardOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    cost_coins: int
    discount_value: float
    discount_display: str
    icon_key: str
    brand_name: str
    stock: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class RedeemRequest(BaseModel):
    reward_id: str


class RedeemResponse(BaseModel):
    success: bool
    message: str
    redemption_id: str
    voucher_code: str
    reward_id: str
    reward_title: str
    coins_spent: int
    remaining_balance: int
    redeemed_at: datetime


class CoinBalanceOut(BaseModel):
    total_earned_coins: int
    total_redeemed_coins: int
    available_balance: int
    lifetime_spend_eligible: float


class RedemptionHistoryItem(BaseModel):
    id: str
    reward_id: str
    reward_title: str
    coins_spent: int
    voucher_code: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RedemptionHistoryResponse(BaseModel):
    redemptions: List[RedemptionHistoryItem]
    total: int
