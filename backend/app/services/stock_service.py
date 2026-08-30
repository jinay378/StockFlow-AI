from sqlalchemy.orm import Session

from app.models.product_model import Product
from app.models.stock_transaction_model import StockTransaction
from app.models.inventory_model import Inventory


def stock_in(db: Session, product_id: int, quantity: int, user_id: int = 1):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.user_id == user_id)
        .first()
    )

    if not product:
        return None

    product.quantity = (product.quantity or 0) + quantity
    inv = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id, Inventory.user_id == user_id)
        .first()
    )
    if inv:
        inv.quantity = product.quantity

    transaction = StockTransaction(
        product_id=product_id,
        quantity=quantity,
        transaction_type="IN",
        user_id=user_id,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def stock_out(db: Session, product_id: int, quantity: int, user_id: int = 1):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.user_id == user_id)
        .first()
    )

    if not product:
        return None

    if (product.quantity or 0) < quantity:
        return "insufficient"

    product.quantity = (product.quantity or 0) - quantity
    inv = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id, Inventory.user_id == user_id)
        .first()
    )
    if inv:
        inv.quantity = product.quantity

    transaction = StockTransaction(
        product_id=product_id,
        quantity=quantity,
        transaction_type="OUT",
        user_id=user_id,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def get_stock_history(db: Session, user_id: int = 1):
    return (
        db.query(StockTransaction)
        .filter(StockTransaction.user_id == user_id)
        .order_by(StockTransaction.created_at.desc())
        .all()
    )
