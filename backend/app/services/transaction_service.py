import math
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc, case

from app.models.transaction import Transaction
from app.schemas.transaction import (
    PaginatedTransactionsResponse,
    TransactionOut,
    TransactionSummaryStats,
    FilterOptionsResponse
)


class TransactionService:
    @staticmethod
    def get_transactions(
        db: Session,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        payment_method: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: str = "timestamp",
        sort_order: str = "desc",
    ) -> PaginatedTransactionsResponse:
        # Base query
        query = db.query(Transaction)

        # Filters
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Transaction.merchant.ilike(term),
                    Transaction.raw_id.ilike(term),
                    Transaction.category.ilike(term)
                )
            )

        if category and category.strip() and category.lower() != "all":
            # Support comma-separated categories for multi-select
            cats = [c.strip() for c in category.split(",") if c.strip()]
            if len(cats) == 1:
                query = query.filter(Transaction.category.ilike(cats[0]))
            else:
                query = query.filter(Transaction.category.in_(cats))

        if status and status.strip() and status.lower() != "all":
            statuses = [s.strip().upper() for s in status.split(",") if s.strip()]
            if len(statuses) == 1:
                query = query.filter(Transaction.status == statuses[0])
            else:
                query = query.filter(Transaction.status.in_(statuses))

        if payment_method and payment_method.strip() and payment_method.lower() != "all":
            methods = [m.strip() for m in payment_method.split(",") if m.strip()]
            if len(methods) == 1:
                query = query.filter(Transaction.payment_method.ilike(methods[0]))
            else:
                query = query.filter(Transaction.payment_method.in_(methods))

        if min_amount is not None:
            query = query.filter(Transaction.amount >= min_amount)

        if max_amount is not None:
            query = query.filter(Transaction.amount <= max_amount)

        if start_date is not None:
            query = query.filter(Transaction.timestamp >= start_date)

        if end_date is not None:
            query = query.filter(Transaction.timestamp <= end_date)

        # Total count
        total = query.count()

        # Summary statistics on filtered set
        stats_query = query.with_entities(
            func.count(Transaction.id).label("total_count"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total_spend"),
            func.coalesce(func.sum(case((Transaction.status == "SUCCESS", 1), else_=0)), 0).label("success_count"),
            func.coalesce(func.sum(case((Transaction.status == "FAILED", 1), else_=0)), 0).label("failed_count"),
            func.coalesce(func.sum(case((Transaction.status == "PENDING", 1), else_=0)), 0).label("pending_count"),
            func.coalesce(func.sum(case((Transaction.is_refund == True, 1), else_=0)), 0).label("refund_count"),
            func.coalesce(func.sum(Transaction.coins_earned), 0).label("total_coins"),
        ).first()

        stats = TransactionSummaryStats(
            total_count=stats_query.total_count or 0,
            total_spend=float(stats_query.total_spend or 0.0),
            success_count=int(stats_query.success_count or 0),
            failed_count=int(stats_query.failed_count or 0),
            pending_count=int(stats_query.pending_count or 0),
            refund_count=int(stats_query.refund_count or 0),
            total_coins_generated=int(stats_query.total_coins or 0),
        )

        # Sorting
        sort_column = getattr(Transaction, sort_by, Transaction.timestamp)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Pagination
        page = max(1, page)
        page_size = min(max(1, page_size), 500)
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return PaginatedTransactionsResponse(
            items=[TransactionOut.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            stats=stats,
        )

    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: str) -> Optional[Transaction]:
        return db.query(Transaction).filter(
            or_(Transaction.id == transaction_id, Transaction.raw_id == transaction_id)
        ).first()

    @staticmethod
    def get_filter_options(db: Session) -> FilterOptionsResponse:
        cats = [
            c[0] for c in db.query(Transaction.category).distinct().order_by(Transaction.category).all()
            if c[0]
        ]
        statuses = [
            s[0] for s in db.query(Transaction.status).distinct().order_by(Transaction.status).all()
            if s[0]
        ]
        methods = [
            m[0] for m in db.query(Transaction.payment_method).distinct().order_by(Transaction.payment_method).all()
            if m[0]
        ]

        min_amt, max_amt = db.query(
            func.min(Transaction.amount),
            func.max(Transaction.amount)
        ).first()

        earliest, latest = db.query(
            func.min(Transaction.timestamp),
            func.max(Transaction.timestamp)
        ).first()

        return FilterOptionsResponse(
            categories=cats,
            statuses=statuses,
            payment_methods=methods,
            min_amount=float(min_amt or 0),
            max_amount=float(max_amt or 0),
            earliest_date=earliest or datetime.now(),
            latest_date=latest or datetime.now(),
        )
