from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.transaction_service import TransactionService
from app.schemas.transaction import (
    PaginatedTransactionsResponse,
    TransactionOut,
    FilterOptionsResponse
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=PaginatedTransactionsResponse)
def list_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=500, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for merchant or transaction ID"),
    category: Optional[str] = Query(None, description="Filter by category (comma-separated or single)"),
    status: Optional[str] = Query(None, description="Filter by payment status (SUCCESS, FAILED, PENDING)"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    min_amount: Optional[float] = Query(None, description="Minimum amount filter"),
    max_amount: Optional[float] = Query(None, description="Maximum amount filter"),
    start_date: Optional[datetime] = Query(None, description="Start date ISO timestamp"),
    end_date: Optional[datetime] = Query(None, description="End date ISO timestamp"),
    sort_by: str = Query("timestamp", description="Column to sort by (timestamp, amount, merchant, category)"),
    sort_order: str = Query("desc", pattern="^(asc|desc|ASC|DESC)$", description="Sort direction"),
    db: Session = Depends(get_db)
):
    """
    Fetch paginated transactions with combinable filters, full-text merchant search, and multi-column sorting.
    Returns transaction items along with aggregated summary stats for the filtered dataset.
    """
    return TransactionService.get_transactions(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        status=status,
        payment_method=payment_method,
        min_amount=min_amount,
        max_amount=max_amount,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order.lower(),
    )


@router.get("/filters", response_model=FilterOptionsResponse)
def get_filter_metadata(db: Session = Depends(get_db)):
    """
    Fetch distinct filter options (categories, statuses, payment methods, amount range, date range)
    to populate dynamic filter controls in the UI.
    """
    return TransactionService.get_filter_options(db)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """
    Fetch complete details of a single transaction by its UUID or raw ID.
    """
    txn = TransactionService.get_transaction_by_id(db, transaction_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction '{transaction_id}' not found."
        )
    return TransactionOut.model_validate(txn)
