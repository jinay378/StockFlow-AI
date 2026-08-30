from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user, require_roles
from app.schemas.sale_schema import SaleCreate, SaleResponse
from app.services.sale_service import (
    get_all_sales,
    get_sale_by_id,
    create_sale,
    delete_sale,
)

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


@router.get("/", response_model=list[SaleResponse])
def read_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_all_sales(db, user_id=current_user.tenant_id)


@router.get("/{sale_id}", response_model=SaleResponse)
def read_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_sale_by_id(db, sale_id, user_id=current_user.tenant_id)


@router.post("/", response_model=SaleResponse)
def add_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return create_sale(db, sale, user_id=current_user.tenant_id)


@router.delete("/{sale_id}")
def remove_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    return delete_sale(db, sale_id, user_id=current_user.tenant_id)
