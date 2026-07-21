from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.stock_schema import StockTransactionCreate
from app.services.stock_service import stock_in
from app.services.stock_service import stock_in, stock_out
from app.services.stock_service import (
    stock_in,
    stock_out,
    get_stock_history
)

router = APIRouter(
    prefix="/stock",
    tags=["Inventory"]
)


@router.post("/in")
def add_stock(
    stock: StockTransactionCreate,
    db: Session = Depends(get_db)
):

    transaction = stock_in(
        db,
        stock.product_id,
        stock.quantity
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
    db: Session = Depends(get_db)
):

    transaction = stock_out(
        db,
        stock.product_id,
        stock.quantity
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
def history(db: Session = Depends(get_db)):
    return get_stock_history(db)