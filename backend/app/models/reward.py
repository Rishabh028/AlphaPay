from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, DateTime
from app.core.database import Base


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String(32), primary_key=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False)
    cost_coins = Column(Integer, nullable=False)
    discount_value = Column(Numeric(10, 2), nullable=False)
    discount_display = Column(String(64), nullable=False)
    icon_key = Column(String(32), nullable=False, default="gift")
    brand_name = Column(String(64), nullable=False)
    stock = Column(Integer, nullable=False, default=100)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
