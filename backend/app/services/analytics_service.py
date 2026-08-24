from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract

from app.models.transaction import Transaction
from app.schemas.analytics import (
    CategorySpendResponse,
    CategorySpendItem,
    MonthlyTrendResponse,
    MonthlyTrendItem,
    AnalyticsOverviewResponse
)

# Harmonious visual palette for category charts
CATEGORY_COLORS = {
    "Travel": "#3B82F6",        # Blue
    "Shopping": "#EC4899",      # Pink
    "Utilities": "#F59E0B",     # Amber
    "Food & Dining": "#10B981", # Emerald
    "Health": "#06B6D4",        # Cyan
    "Education": "#8B5CF6",     # Purple
    "Entertainment": "#F97316", # Orange
    "Groceries": "#84CC16",     # Lime
    "Fuel": "#EF4444",          # Red
    "Insurance": "#6366F1",     # Indigo
    "General": "#64748B",       # Slate
}


class AnalyticsService:
    @staticmethod
    def get_category_spend(
        db: Session,
        status: str = "SUCCESS",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> CategorySpendResponse:
        query = db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("txn_count")
        )

        if status and status.upper() != "ALL":
            query = query.filter(Transaction.status == status.upper())

        # Exclude refunds/negative amounts from positive spend breakdown
        query = query.filter(Transaction.amount > 0)

        if start_date:
            query = query.filter(Transaction.timestamp >= start_date)
        if end_date:
            query = query.filter(Transaction.timestamp <= end_date)

        results = query.group_by(Transaction.category).order_by(desc("total_amount")).all()

        total_spend = sum(float(r.total_amount or 0) for r in results)

        items: List[CategorySpendItem] = []
        for r in results:
            cat_total = float(r.total_amount or 0)
            pct = (cat_total / total_spend * 100.0) if total_spend > 0 else 0.0
            items.append(
                CategorySpendItem(
                    category=r.category,
                    total_amount=round(cat_total, 2),
                    transaction_count=int(r.txn_count or 0),
                    percentage=round(pct, 1),
                    color_hint=CATEGORY_COLORS.get(r.category, "#94A3B8"),
                )
            )

        return CategorySpendResponse(
            total_spend=round(total_spend, 2),
            categories=items
        )

    @staticmethod
    def get_monthly_trend(
        db: Session,
        category: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> MonthlyTrendResponse:
        query = db.query(
            Transaction.timestamp,
            Transaction.amount,
            Transaction.status,
            Transaction.coins_earned
        )

        if category and category.strip() and category.lower() != "all":
            query = query.filter(Transaction.category.ilike(category.strip()))

        if start_date:
            query = query.filter(Transaction.timestamp >= start_date)
        if end_date:
            query = query.filter(Transaction.timestamp <= end_date)

        rows = query.all()

        # Group by Year-Month in Python to ensure portable grouping across SQLite & PostgreSQL
        month_data = {}
        total_spend = 0.0

        for r in rows:
            if not r.timestamp:
                continue
            month_key = r.timestamp.strftime("%Y-%m")
            month_label = r.timestamp.strftime("%b %Y")

            if month_key not in month_data:
                month_data[month_key] = {
                    "month_key": month_key,
                    "month_label": month_label,
                    "total_spend": 0.0,
                    "transaction_count": 0,
                    "success_count": 0,
                    "failed_count": 0,
                    "coins_earned": 0,
                }

            amt = float(r.amount or 0)
            month_data[month_key]["transaction_count"] += 1
            if r.status == "SUCCESS":
                month_data[month_key]["success_count"] += 1
                if amt > 0:
                    month_data[month_key]["total_spend"] += amt
                    total_spend += amt
                month_data[month_key]["coins_earned"] += int(r.coins_earned or 0)
            elif r.status == "FAILED":
                month_data[month_key]["failed_count"] += 1

        # Sort months chronologically
        sorted_keys = sorted(month_data.keys())
        items = [
            MonthlyTrendItem(
                month_key=k,
                month_label=month_data[k]["month_label"],
                total_spend=round(month_data[k]["total_spend"], 2),
                transaction_count=month_data[k]["transaction_count"],
                success_count=month_data[k]["success_count"],
                failed_count=month_data[k]["failed_count"],
                coins_earned=month_data[k]["coins_earned"],
            )
            for k in sorted_keys
        ]

        return MonthlyTrendResponse(
            total_spend=round(total_spend, 2),
            months=items
        )

    @staticmethod
    def get_overview_stats(db: Session) -> AnalyticsOverviewResponse:
        total_spend_q = db.query(
            func.coalesce(func.sum(Transaction.amount), 0),
            func.count(Transaction.id),
            func.coalesce(func.sum(Transaction.coins_earned), 0)
        ).filter(Transaction.status == "SUCCESS", Transaction.amount > 0).first()

        total_spend = float(total_spend_q[0] or 0.0)
        total_txns = int(total_spend_q[1] or 0)
        total_coins = int(total_spend_q[2] or 0)
        avg_val = (total_spend / total_txns) if total_txns > 0 else 0.0

        top_cat_q = db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("sum_amt")
        ).filter(Transaction.status == "SUCCESS").group_by(Transaction.category).order_by(desc("sum_amt")).first()

        top_merchant_q = db.query(
            Transaction.merchant,
            func.sum(Transaction.amount).label("sum_amt")
        ).filter(Transaction.status == "SUCCESS").group_by(Transaction.merchant).order_by(desc("sum_amt")).first()

        return AnalyticsOverviewResponse(
            total_spend=round(total_spend, 2),
            total_transactions=total_txns,
            avg_transaction_value=round(avg_val, 2),
            top_category=top_cat_q[0] if top_cat_q else "N/A",
            top_merchant=top_merchant_q[0] if top_merchant_q else "N/A",
            total_coins_earned=total_coins,
        )
