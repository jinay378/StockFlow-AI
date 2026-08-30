from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import require_roles
from app.schemas.stock_adjustment_schema import StockAdjustmentCreate
from app.services.stock_adjustment_service import (
    create_stock_adjustment,
    get_stock_adjustments,
    get_stock_adjustment,
    delete_stock_adjustment,
)

router = APIRouter(
    prefix="/stock-adjustments",
    tags=["Stock Adjustments"],
    dependencies=[Depends(require_roles("admin", "manager"))],
)


@router.post("/")
def add_adjustment(
    adjustment: StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    record = create_stock_adjustment(db, adjustment, user_id=current_user.tenant_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if record == "insufficient":
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock for this decrease"
        )

    if record == "invalid_type":
        raise HTTPException(
            status_code=400,
            detail="adjustment_type must be INCREASE or DECREASE"
        )

    return {
        "message": "Stock adjustment recorded successfully",
        "id": record.id
    }


@router.get("/")
def all_adjustments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    return get_stock_adjustments(db, user_id=current_user.tenant_id)


@router.get("/{adjustment_id}")
def single_adjustment(
    adjustment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    record = get_stock_adjustment(db, adjustment_id, user_id=current_user.tenant_id)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Stock adjustment not found"
        )

    return record


@router.delete("/{adjustment_id}")
def remove_adjustment(
    adjustment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    record = delete_stock_adjustment(db, adjustment_id, user_id=current_user.tenant_id)

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Stock adjustment not found"
        )

    return {"message": "Stock adjustment deleted successfully"}
