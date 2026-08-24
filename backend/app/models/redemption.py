import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reward_id = Column(String(32), ForeignKey("rewards.id"), nullable=False, index=True)
    reward_title = Column(String(128), nullable=False)
    coins_spent = Column(Integer, nullable=False)
    voucher_code = Column(String(64), nullable=False, unique=True)
    status = Column(String(32), nullable=False, default="COMPLETED")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    reward = relationship("Reward")
