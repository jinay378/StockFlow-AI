from sqlalchemy.orm import Session

from app.models.product_model import Product
from app.models.stock_adjustment_model import StockAdjustment
from app.models.inventory_model import Inventory
from app.schemas.stock_adjustment_schema import StockAdjustmentCreate


def create_stock_adjustment(db: Session, adjustment: StockAdjustmentCreate, user_id: int = 1):
    product = (
        db.query(Product)
        .filter(Product.id == adjustment.product_id, Product.user_id == user_id)
        .first()
    )

    if not product:
        return None

    if adjustment.adjustment_type == "INCREASE":
        product.quantity = (product.quantity or 0) + adjustment.quantity

    elif adjustment.adjustment_type == "DECREASE":
        if (product.quantity or 0) < adjustment.quantity:
            return "insufficient"

        product.quantity = (product.quantity or 0) - adjustment.quantity

    else:
        return "invalid_type"

    inv = (
        db.query(Inventory)
        .filter(Inventory.product_id == adjustment.product_id, Inventory.user_id == user_id)
        .first()
    )
    if inv:
        inv.quantity = product.quantity

    record = StockAdjustment(
        product_id=adjustment.product_id,
        quantity=adjustment.quantity,
        adjustment_type=adjustment.adjustment_type,
        reason=adjustment.reason,
        user_id=user_id,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_stock_adjustments(db: Session, user_id: int = 1):
    return (
        db.query(StockAdjustment)
        .filter(StockAdjustment.user_id == user_id)
        .order_by(StockAdjustment.created_at.desc())
        .all()
    )


def get_stock_adjustment(db: Session, adjustment_id: int, user_id: int = 1):
    return (
        db.query(StockAdjustment)
        .filter(StockAdjustment.id == adjustment_id, StockAdjustment.user_id == user_id)
        .first()
    )


def delete_stock_adjustment(db: Session, adjustment_id: int, user_id: int = 1):
    record = (
        db.query(StockAdjustment)
        .filter(StockAdjustment.id == adjustment_id, StockAdjustment.user_id == user_id)
        .first()
    )

    if not record:
        return None

    db.delete(record)
    db.commit()

    return record
