from sqlalchemy.orm import Session

from app.models.inventory_model import Inventory


def create_inventory(db: Session, inventory, user_id: int = 1):
    new_inventory = Inventory(
        product_id=inventory.product_id,
        quantity=inventory.quantity,
        minimum_stock=inventory.minimum_stock,
        warehouse=inventory.warehouse,
        user_id=user_id,
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory


def get_inventory(db: Session, user_id: int = 1):
    return db.query(Inventory).filter(Inventory.user_id == user_id).all()


def get_inventory_by_id(db: Session, inventory_id: int, user_id: int = 1):
    return (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id, Inventory.user_id == user_id)
        .first()
    )


def update_inventory(db: Session, inventory_id: int, inventory, user_id: int = 1):
    existing_inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id, Inventory.user_id == user_id)
        .first()
    )

    if not existing_inventory:
        return None

    existing_inventory.product_id = inventory.product_id
    existing_inventory.quantity = inventory.quantity
    existing_inventory.minimum_stock = inventory.minimum_stock
    existing_inventory.warehouse = inventory.warehouse

    db.commit()
    db.refresh(existing_inventory)

    return existing_inventory


def delete_inventory(db: Session, inventory_id: int, user_id: int = 1):
    existing_inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id, Inventory.user_id == user_id)
        .first()
    )

    if not existing_inventory:
        return False

    db.delete(existing_inventory)
    db.commit()

    return True
