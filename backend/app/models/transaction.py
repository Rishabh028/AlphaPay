import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Boolean, DateTime, Index
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    raw_id = Column(String(64), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    merchant = Column(String(128), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False, index=True)
    currency = Column(String(8), nullable=False, default="INR")
    status = Column(String(16), nullable=False, index=True)
    payment_method = Column(String(32), nullable=False, index=True)
    is_refund = Column(Boolean, nullable=False, default=False)
    coins_earned = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("ix_txn_category_status", "category", "status"),
        Index("ix_txn_merchant_status", "merchant", "status"),
        Index("ix_txn_timestamp_amount", "timestamp", "amount"),
    )
