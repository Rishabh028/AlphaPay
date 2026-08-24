from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.reward_service import RewardService
from app.schemas.reward import (
    RewardOut,
    CoinBalanceOut,
    RedeemRequest,
    RedeemResponse,
    RedemptionHistoryResponse
)

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("/balance", response_model=CoinBalanceOut)
def get_coin_balance(db: Session = Depends(get_db)):
    """
    Get user's live reward coin balance: total earned coins, redeemed coins, and current available balance.
    """
    return RewardService.get_coin_balance(db)


@router.get("/catalogue", response_model=List[RewardOut])
def get_rewards_catalogue(db: Session = Depends(get_db)):
    """
    Get the catalogue of available rewards (vouchers, cashback, perks) with coin costs and stock.
    """
    return RewardService.get_catalogue(db)


@router.post("/redeem", response_model=RedeemResponse, status_code=status.HTTP_200_OK)
def redeem_reward(payload: RedeemRequest, db: Session = Depends(get_db)):
    """
    Redeem a reward with coins. Validates balance and catalogue existence, decrements balance,
    and returns a unique voucher code with updated ledger details.
    Rejects with 400 if insufficient balance or out of stock, 404 if reward not found.
    """
    return RewardService.redeem_reward(db=db, reward_id=payload.reward_id)


@router.get("/history", response_model=RedemptionHistoryResponse)
def get_redemption_history(db: Session = Depends(get_db)):
    """
    Get the historical audit log of all redeemed vouchers and coins spent.
    """
    return RewardService.get_redemption_history(db)
