from sqlalchemy.orm import Session

from app.models.supplier_model import Supplier
from app.schemas.supplier_schema import SupplierCreate


# -----------------------------
# Create Supplier
# -----------------------------
def create_supplier(db: Session, supplier: SupplierCreate):

    new_supplier = Supplier(
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
    )

    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)

    return new_supplier


# -----------------------------
# Get All Suppliers
# -----------------------------
def get_suppliers(db: Session):
    return db.query(Supplier).all()


# -----------------------------
# Get Single Supplier
# -----------------------------
def get_supplier(db: Session, supplier_id: int):
    return (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )


# -----------------------------
# Update Supplier
# -----------------------------
def update_supplier(
    db: Session,
    supplier_id: int,
    supplier: SupplierCreate,
):

    existing_supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not existing_supplier:
        return None

    existing_supplier.name = supplier.name
    existing_supplier.email = supplier.email
    existing_supplier.phone = supplier.phone
    existing_supplier.address = supplier.address

    db.commit()
    db.refresh(existing_supplier)

    return existing_supplier


# -----------------------------
# Delete Supplier
# -----------------------------
def delete_supplier(
    db: Session,
    supplier_id: int,
):

    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        return False

    db.delete(supplier)
    db.commit()

    return True