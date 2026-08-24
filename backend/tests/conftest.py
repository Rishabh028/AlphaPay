import os
import sys
import pytest
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Force SQLite test DB in environment before config is loaded
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# Ensure app package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.models.transaction import Transaction
from app.models.reward import Reward
from app.models.redemption import Redemption
from app.main import app

# In-memory test database with StaticPool so all connections share the same in-memory DB
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_data(db_session):
    # Seed sample transactions
    now = datetime(2026, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
    
    t1 = Transaction(
        id="t-1",
        raw_id="TXN1001",
        timestamp=now,
        merchant="Amazon",
        category="Shopping",
        amount=2500.00,
        currency="INR",
        status="SUCCESS",
        payment_method="Credit Card",
        is_refund=False,
        coins_earned=25,
    )
    t2 = Transaction(
        id="t-2",
        raw_id="TXN1002",
        timestamp=now - timedelta(days=5),
        merchant="Swiggy",
        category="Food & Dining",
        amount=750.00,
        currency="INR",
        status="SUCCESS",
        payment_method="UPI",
        is_refund=False,
        coins_earned=7,
    )
    t3 = Transaction(
        id="t-3",
        raw_id="TXN1003",
        timestamp=now - timedelta(days=10),
        merchant="Uber",
        category="Travel",
        amount=400.00,
        currency="INR",
        status="FAILED",
        payment_method="Debit Card",
        is_refund=False,
        coins_earned=0,
    )
    t4 = Transaction(
        id="t-4",
        raw_id="TXN1004",
        timestamp=now - timedelta(days=15),
        merchant="Amazon",
        category="Shopping",
        amount=15000.00,
        currency="INR",
        status="SUCCESS",
        payment_method="Credit Card",
        is_refund=False,
        coins_earned=100,  # Capped at 100
    )

    # Seed sample reward
    r1 = Reward(
        id="rew_swiggy_250",
        title="Swiggy ₹250 Voucher",
        description="Get ₹250 off food delivery",
        category="Food & Dining",
        cost_coins=25,
        discount_value=250.00,
        discount_display="₹250 Off",
        icon_key="utensils",
        brand_name="Swiggy",
        stock=10,
        is_active=True,
    )

    r2 = Reward(
        id="rew_expensive_9999",
        title="Luxury Travel Pass",
        description="₹50,000 off international flights",
        category="Travel",
        cost_coins=99999,
        discount_value=50000.00,
        discount_display="₹50,000 Off",
        icon_key="plane",
        brand_name="Airways",
        stock=2,
        is_active=True,
    )

    db_session.add_all([t1, t2, t3, t4, r1, r2])
    db_session.commit()
    return {"t1": t1, "t2": t2, "t3": t3, "t4": t4, "r1": r1, "r2": r2}
