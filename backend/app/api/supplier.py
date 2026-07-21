from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
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
):
    supplier = create_supplier(db, supplier)

    return {
        "message": "Supplier created successfully",
        "id": supplier.id,
        "name": supplier.name,
    }

@router.get("/")
def all_suppliers(db: Session = Depends(get_db)):
    return get_suppliers(db)

@router.get("/{supplier_id}")
def supplier(supplier_id: int, db: Session = Depends(get_db)):
    return get_supplier(db, supplier_id)

@router.put("/{supplier_id}")
def update(supplier_id: int, supplier: SupplierCreate, db: Session = Depends(get_db)):
    updated = update_supplier(db, supplier_id, supplier)

    if not updated:
        return {"message": "Supplier not found"}

    return {"message": "Supplier updated successfully"}


@router.delete("/{supplier_id}")
def delete(supplier_id: int, db: Session = Depends(get_db)):
    deleted = delete_supplier(db, supplier_id)

    if not deleted:
        return {"message": "Supplier not found"}

    return {"message": "Supplier deleted successfully"}