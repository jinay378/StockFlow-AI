from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import require_roles
from app.schemas.purchase_schema import PurchaseCreate, PurchaseResponse
from app.services.purchase_service import (
    get_all_purchases,
    get_purchase_by_id,
    create_purchase,
    delete_purchase,
)

router = APIRouter(
    prefix="/purchases",
    tags=["Purchases"],
    dependencies=[Depends(require_roles("admin", "manager"))],
)


@router.get("/", response_model=list[PurchaseResponse])
def fetch_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    return get_all_purchases(db, user_id=current_user.tenant_id)


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def fetch_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    purchase = get_purchase_by_id(db, purchase_id, user_id=current_user.tenant_id)

    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    return purchase


@router.post("/", response_model=PurchaseResponse)
def add_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    try:
        return create_purchase(db, purchase, user_id=current_user.tenant_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{purchase_id}")
def remove_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    try:
        delete_purchase(db, purchase_id, user_id=current_user.tenant_id)
        return {"message": "Purchase deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
