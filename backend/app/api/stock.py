from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user
from app.schemas.stock_schema import StockTransactionCreate
from app.services.stock_service import (
    stock_in,
    stock_out,
    get_stock_history,
)

router = APIRouter(
    prefix="/stock",
    tags=["Inventory"]
)


@router.post("/in")
def add_stock(
    stock: StockTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    transaction = stock_in(
        db,
        stock.product_id,
        stock.quantity,
        user_id=current_user.id,
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Stock added successfully",
        "transaction_id": transaction.id
    }


@router.post("/out")
def remove_stock(
    stock: StockTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    transaction = stock_out(
        db,
        stock.product_id,
        stock.quantity,
        user_id=current_user.id,
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if transaction == "insufficient":
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    return {
        "message": "Stock removed successfully",
        "transaction_id": transaction.id
    }


@router.get("/history")
def history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_stock_history(db, user_id=current_user.id)
