from sqlalchemy.orm import Session

from app.models.product_model import Product
from app.models.stock_transaction_model import StockTransaction


def stock_in(db: Session, product_id: int, quantity: int):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return None

    product.quantity += quantity

    transaction = StockTransaction(
        product_id=product_id,
        quantity=quantity,
        transaction_type="IN"
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def stock_out(db: Session, product_id: int, quantity: int):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return None

    if product.quantity < quantity:
        return "insufficient"

    product.quantity -= quantity

    transaction = StockTransaction(
        product_id=product_id,
        quantity=quantity,
        transaction_type="OUT"
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def get_stock_history(db: Session):
    return db.query(StockTransaction).all()