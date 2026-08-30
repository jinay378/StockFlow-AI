from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user, require_roles
from app.schemas.supplier_schema import SupplierCreate
from app.services.supplier_service import (
    create_supplier,
    get_suppliers,
    get_supplier,
    update_supplier,
    delete_supplier,
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
)


@router.post("/")
def add_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    created = create_supplier(db, supplier, user_id=current_user.tenant_id)

    return {
        "message": "Supplier created successfully",
        "id": created.id,
        "name": created.name,
    }


@router.get("/")
def all_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_suppliers(db, user_id=current_user.tenant_id)


@router.get("/{supplier_id}")
def supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    res = get_supplier(db, supplier_id, user_id=current_user.tenant_id)
    if not res:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return res


@router.put("/{supplier_id}")
def update(
    supplier_id: int,
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    updated = update_supplier(db, supplier_id, supplier, user_id=current_user.tenant_id)

    if not updated:
        raise HTTPException(status_code=404, detail="Supplier not found")

    return {"message": "Supplier updated successfully"}


@router.delete("/{supplier_id}")
def delete(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    deleted = delete_supplier(db, supplier_id, user_id=current_user.tenant_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Supplier not found")

    return {"message": "Supplier deleted successfully"}
