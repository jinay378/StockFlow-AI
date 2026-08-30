from sqlalchemy.orm import Session

from app.models.supplier_model import Supplier
from app.schemas.supplier_schema import SupplierCreate


def create_supplier(db: Session, supplier: SupplierCreate, user_id: int = 1):
    new_supplier = Supplier(
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        user_id=user_id,
    )

    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)

    return new_supplier


def get_suppliers(db: Session, user_id: int = 1):
    return db.query(Supplier).filter(Supplier.user_id == user_id).all()


def get_supplier(db: Session, supplier_id: int, user_id: int = 1):
    return (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id, Supplier.user_id == user_id)
        .first()
    )


def update_supplier(
    db: Session,
    supplier_id: int,
    supplier: SupplierCreate,
    user_id: int = 1,
):
    existing_supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id, Supplier.user_id == user_id)
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


def delete_supplier(
    db: Session,
    supplier_id: int,
    user_id: int = 1,
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id, Supplier.user_id == user_id)
        .first()
    )

    if not supplier:
        return False

    db.delete(supplier)
    db.commit()

    return True
