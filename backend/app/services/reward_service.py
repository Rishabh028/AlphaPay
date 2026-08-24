import uuid
import secrets
import string
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.transaction import Transaction
from app.models.reward import Reward
from app.models.redemption import Redemption
from app.schemas.reward import (
    RewardOut,
    CoinBalanceOut,
    RedeemResponse,
    RedemptionHistoryItem,
    RedemptionHistoryResponse
)


def generate_voucher_code(brand_prefix: str = "DAT") -> str:
    """Generate a clean, readable voucher code like AMZN-8X7K-9P2W"""
    prefix = brand_prefix.upper()[:4].replace(" ", "")
    chars = string.ascii_uppercase + "23456789"
    part1 = "".join(secrets.choice(chars) for _ in range(4))
    part2 = "".join(secrets.choice(chars) for _ in range(4))
    return f"{prefix}-{part1}-{part2}"


class RewardService:
    @staticmethod
    def get_coin_balance(db: Session) -> CoinBalanceOut:
        # Earned coins from all SUCCESS transactions
        earned_res = db.query(
            func.coalesce(func.sum(Transaction.coins_earned), 0),
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(Transaction.status == "SUCCESS", Transaction.amount > 0).first()

        total_earned = int(earned_res[0] or 0)
        lifetime_spend = float(earned_res[1] or 0.0)

        # Redeemed coins from Redemptions ledger
        redeemed_res = db.query(
            func.coalesce(func.sum(Redemption.coins_spent), 0)
        ).filter(Redemption.status == "COMPLETED").first()

        total_redeemed = int(redeemed_res[0] or 0)
        available_balance = max(0, total_earned - total_redeemed)

        return CoinBalanceOut(
            total_earned_coins=total_earned,
            total_redeemed_coins=total_redeemed,
            available_balance=available_balance,
            lifetime_spend_eligible=lifetime_spend,
        )

    @staticmethod
    def get_catalogue(db: Session) -> List[RewardOut]:
        rewards = db.query(Reward).filter(Reward.is_active == True).order_by(Reward.cost_coins.asc()).all()
        return [RewardOut.model_validate(r) for r in rewards]

    @staticmethod
    def get_reward_by_id(db: Session, reward_id: str) -> Reward:
        reward = db.query(Reward).filter(Reward.id == reward_id).first()
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reward with ID '{reward_id}' not found in catalogue."
            )
        return reward

    @staticmethod
    def redeem_reward(db: Session, reward_id: str) -> RedeemResponse:
        # 1. Verify reward existence
        reward = db.query(Reward).filter(Reward.id == reward_id).first()
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reward '{reward_id}' does not exist in the catalogue."
            )

        if not reward.is_active or reward.stock <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Reward '{reward.title}' is currently out of stock or inactive."
            )

        # 2. Check current balance
        balance_info = RewardService.get_coin_balance(db)
        if balance_info.available_balance < reward.cost_coins:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient coins. You have {balance_info.available_balance} coins, but {reward.cost_coins} coins are required."
            )

        # 3. Process redemption atomically
        try:
            brand_code = reward.brand_name.split()[0] if reward.brand_name else "DAT"
            voucher_code = generate_voucher_code(brand_code)
            now = datetime.now(timezone.utc)

            redemption = Redemption(
                id=str(uuid.uuid4()),
                reward_id=reward.id,
                reward_title=reward.title,
                coins_spent=reward.cost_coins,
                voucher_code=voucher_code,
                status="COMPLETED",
                created_at=now,
            )

            # Decrement reward stock
            reward.stock = max(0, reward.stock - 1)

            db.add(redemption)
            db.commit()
            db.refresh(redemption)

            new_balance = balance_info.available_balance - reward.cost_coins

            return RedeemResponse(
                success=True,
                message=f"Successfully redeemed '{reward.title}' for {reward.cost_coins} coins!",
                redemption_id=redemption.id,
                voucher_code=voucher_code,
                reward_id=reward.id,
                reward_title=reward.title,
                coins_spent=reward.cost_coins,
                remaining_balance=new_balance,
                redeemed_at=now,
            )
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Redemption transaction failed: {str(e)}"
            )

    @staticmethod
    def get_redemption_history(db: Session) -> RedemptionHistoryResponse:
        redemptions = db.query(Redemption).order_by(Redemption.created_at.desc()).all()
        return RedemptionHistoryResponse(
            redemptions=[RedemptionHistoryItem.model_validate(r) for r in redemptions],
            total=len(redemptions),
        )
