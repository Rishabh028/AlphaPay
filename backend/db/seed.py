import json
import math
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
import dateutil.parser

# Add parent directory to sys.path to import backend modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.models.transaction import Transaction
from app.models.reward import Reward
from app.models.redemption import Redemption

# Deterministic mapping discovered from dataset analysis
MERCHANT_CATEGORY_MAP: Dict[str, str] = {
    "1mg": "Health",
    "ACT Fibernet": "Utilities",
    "Airtel": "Utilities",
    "Ajio": "Shopping",
    "Amazon": "Shopping",
    "Apollo Pharmacy": "Health",
    "BPCL": "Fuel",
    "BSES": "Utilities",
    "BYJU'S": "Education",
    "BigBasket": "Groceries",
    "Blinkit": "Groceries",
    "BookMyShow": "Entertainment",
    "Coursera": "Education",
    "Croma": "Shopping",
    "Cult.fit": "Health",
    "DMart": "Groceries",
    "Domino's": "Food & Dining",
    "Flipkart": "Shopping",
    "HDFC Ergo": "Insurance",
    "HP Petrol": "Fuel",
    "Hotstar": "Entertainment",
    "IRCTC": "Travel",
    "IndiGo": "Travel",
    "Indian Oil": "Fuel",
    "Jio": "Utilities",
    "JioMart": "Groceries",
    "LIC Premium": "Insurance",
    "MakeMyTrip": "Travel",
    "McDonald's": "Food & Dining",
    "Myntra": "Shopping",
    "Netflix": "Entertainment",
    "Nykaa": "Shopping",
    "Ola": "Travel",
    "PharmEasy": "Health",
    "Policybazaar": "Insurance",
    "Practo": "Health",
    "Rapido": "Travel",
    "Shell": "Fuel",
    "Spotify": "Entertainment",
    "Starbucks": "Food & Dining",
    "Swiggy": "Food & Dining",
    "Tata Power": "Utilities",
    "Uber": "Travel",
    "Udemy": "Education",
    "Unacademy": "Education",
    "YouTube Premium": "Entertainment",
    "Zepto": "Groceries",
    "Zomato": "Food & Dining",
    "upGrad": "Education",
}

# Curated Rewards Catalogue (4-6 items as requested)
INITIAL_REWARDS = [
    {
        "id": "rew_amazon_500",
        "title": "Amazon Shopping Voucher",
        "description": "Get ₹500 off on your next Amazon purchase across electronics, fashion, and books.",
        "category": "Shopping",
        "cost_coins": 500,
        "discount_value": 500.00,
        "discount_display": "₹500 E-Voucher",
        "icon_key": "shopping-bag",
        "brand_name": "Amazon",
        "stock": 250,
        "is_active": True
    },
    {
        "id": "rew_swiggy_250",
        "title": "Swiggy Gourmet Feast",
        "description": "Enjoy ₹250 flat instant discount on Swiggy Gourmet & food delivery orders.",
        "category": "Food & Dining",
        "cost_coins": 250,
        "discount_value": 250.00,
        "discount_display": "₹250 Food Credit",
        "icon_key": "utensils",
        "brand_name": "Swiggy",
        "stock": 400,
        "is_active": True
    },
    {
        "id": "rew_mmt_1000",
        "title": "MakeMyTrip Flight Cashback",
        "description": "Save ₹1,000 instant cashback on domestic & international flight bookings.",
        "category": "Travel",
        "cost_coins": 1000,
        "discount_value": 1000.00,
        "discount_display": "₹1,000 Flight Pass",
        "icon_key": "plane",
        "brand_name": "MakeMyTrip",
        "stock": 100,
        "is_active": True
    },
    {
        "id": "rew_spotify_3m",
        "title": "Spotify Premium 3 Months",
        "description": "3 Months of uninterrupted, ad-free music and high-fidelity offline downloads.",
        "category": "Entertainment",
        "cost_coins": 350,
        "discount_value": 357.00,
        "discount_display": "3 Months Free",
        "icon_key": "music",
        "brand_name": "Spotify",
        "stock": 150,
        "is_active": True
    },
    {
        "id": "rew_bpcl_150",
        "title": "BPCL Fuel Cash Card",
        "description": "₹150 fuel credit redeemable at any BPCL smart petrol pump across India.",
        "category": "Fuel",
        "cost_coins": 150,
        "discount_value": 150.00,
        "discount_display": "₹150 Fuel Topup",
        "icon_key": "fuel",
        "brand_name": "BPCL",
        "stock": 500,
        "is_active": True
    },
    {
        "id": "rew_apple_2000",
        "title": "Apple Store Gift Card",
        "description": "₹2,000 gift card towards Apple hardware, accessories, apps, and services.",
        "category": "Shopping",
        "cost_coins": 2000,
        "discount_value": 2000.00,
        "discount_display": "₹2,000 Store Card",
        "icon_key": "gift",
        "brand_name": "Apple",
        "stock": 50,
        "is_active": True
    }
]


def parse_timestamp(ts: Any) -> datetime:
    """Parse heterogeneous timestamp formats into UTC datetime."""
    if ts is None:
        return datetime.now(timezone.utc)
    if isinstance(ts, (int, float)):
        # If timestamp is in milliseconds
        if ts > 1e11:
            return datetime.fromtimestamp(ts / 1000.0, tz=timezone.utc)
        return datetime.fromtimestamp(ts, tz=timezone.utc)
    if isinstance(ts, str):
        ts = ts.strip()
        # Slash format: DD/MM/YYYY HH:MM:SS
        if "/" in ts:
            parts = ts.split()
            date_parts = parts[0].split("/")
            if len(date_parts) == 3:
                day, month, year = map(int, date_parts)
                time_str = parts[1] if len(parts) > 1 else "00:00:00"
                h, m, s = map(int, time_str.split(":"))
                return datetime(year, month, day, h, m, s, tzinfo=timezone.utc)
        # ISO / Dateutil
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            dt = dateutil.parser.parse(ts)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
    return datetime.now(timezone.utc)


def parse_amount(val: Any) -> float:
    """Sanitize string and float amounts."""
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = val.replace(",", "").replace("₹", "").strip()
        try:
            return float(cleaned)
        except Exception:
            return 0.0
    return 0.0


def calculate_coins(amount: float, status: str) -> int:
    """Calculate reward coins: 1 coin per 100 INR spent on SUCCESS, capped at 100 per transaction."""
    if status.upper() != "SUCCESS" or amount <= 0:
        return 0
    raw_coins = int(math.floor(amount / settings.REWARD_COIN_SPEND_UNIT))
    return min(raw_coins, settings.REWARD_COIN_MAX_PER_TXN)


def find_transactions_file() -> Path:
    """Look for transactions.json in common locations."""
    candidates = [
        Path("transactions.json"),
        Path("../transactions.json"),
        Path(__file__).resolve().parent.parent.parent / "transactions.json",
        Path(__file__).resolve().parent.parent / "transactions.json",
    ]
    for c in candidates:
        if c.exists():
            return c.resolve()
    raise FileNotFoundError("transactions.json not found in workspace.")


def seed_database():
    print("=" * 60)
    print(">> Digital Alpha Technology Database Seeder")
    print("=" * 60)
    start_time = time.time()

    # 1. Create tables
    print("\n[1/4] Ensuring database schema and tables exist...")
    Base.metadata.create_all(bind=engine)
    print("  [OK] Schema initialized successfully.")

    db = SessionLocal()

    try:
        # 2. Seed Rewards Catalogue
        print("\n[2/4] Seeding Rewards Catalogue...")
        for r_data in INITIAL_REWARDS:
            existing = db.query(Reward).filter(Reward.id == r_data["id"]).first()
            if not existing:
                reward = Reward(**r_data)
                db.add(reward)
            else:
                for k, v in r_data.items():
                    setattr(existing, k, v)
        db.commit()
        print(f"  [OK] {len(INITIAL_REWARDS)} rewards seeded/updated.")

        # 3. Read and Sanitize transactions.json
        json_path = find_transactions_file()
        print(f"\n[3/4] Loading and sanitizing transactions from: {json_path}")

        with open(json_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        print(f"  [OK] Read {len(raw_data):,} records from JSON.")

        # Clear existing transactions for idempotent clean re-seeding
        deleted_count = db.query(Transaction).delete()
        if deleted_count > 0:
            print(f"  [OK] Cleared {deleted_count:,} previous transaction records.")

        sanitized_transactions: List[Dict[str, Any]] = []
        total_coins = 0
        total_spend = 0.0

        for item in raw_data:
            raw_id = str(item.get("id", "")).strip()
            merchant = str(item.get("merchant", "Unknown")).strip()
            
            # Category normalization & imputation
            category = item.get("category")
            if not category or not str(category).strip():
                category = MERCHANT_CATEGORY_MAP.get(merchant, "General")
            else:
                category = str(category).strip()

            # Status normalization
            raw_status = str(item.get("status", "PENDING")).strip().upper()
            status = "SUCCESS" if raw_status == "SUCCESS" else ("FAILED" if raw_status == "FAILED" else "PENDING")

            # Timestamp parsing
            timestamp = parse_timestamp(item.get("timestamp"))

            # Amount parsing
            amount = parse_amount(item.get("amount"))
            is_refund = amount < 0

            # Currency & Payment method
            currency = str(item.get("currency", "INR")).strip() or "INR"
            payment_method = str(item.get("payment_method", "Credit Card")).strip() or "Credit Card"

            # Coins calculation
            coins = calculate_coins(amount, status)
            total_coins += coins
            if status == "SUCCESS" and amount > 0:
                total_spend += amount

            # Generate unique surrogate UUID to handle duplicate raw_ids seamlessly
            record_id = str(uuid.uuid4())

            sanitized_transactions.append({
                "id": record_id,
                "raw_id": raw_id,
                "timestamp": timestamp,
                "merchant": merchant,
                "category": category,
                "amount": round(amount, 2),
                "currency": currency,
                "status": status,
                "payment_method": payment_method,
                "is_refund": is_refund,
                "coins_earned": coins,
                "created_at": datetime.now(timezone.utc)
            })

        # 4. High-performance batch insertion
        print("\n[4/4] Inserting sanitized records into Database...")
        batch_size = 1000
        total_records = len(sanitized_transactions)
        for i in range(0, total_records, batch_size):
            batch = sanitized_transactions[i:i + batch_size]
            db.bulk_insert_mappings(Transaction, batch)
            db.commit()
            print(f"  -> Ingested {min(i + batch_size, total_records):,}/{total_records:,} rows...")

        duration = time.time() - start_time
        print("\n" + "=" * 60)
        print("SEED COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print(f"  * Total Transactions Ingested: {total_records:,}")
        print(f"  * Total Eligible Spend: INR {total_spend:,.2f}")
        print(f"  * Total Reward Coins Generated: {total_coins:,} coins")
        print(f"  * Rewards Catalogue Items: {len(INITIAL_REWARDS)}")
        print(f"  * Ingestion Time: {duration:.2f} seconds")
        print("=" * 60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Database seeding failed: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
