from sqlalchemy.orm import Session

from app.models.purchase_model import Purchase, PurchaseItem
from app.models.product_model import Product
from app.models.supplier_model import Supplier
from app.models.inventory_model import Inventory
from app.schemas.purchase_schema import PurchaseCreate


def get_all_purchases(db: Session, user_id: int = 1):
    return (
        db.query(Purchase)
        .filter(Purchase.user_id == user_id)
        .order_by(Purchase.created_at.desc())
        .all()
    )


def get_purchase_by_id(db: Session, purchase_id: int, user_id: int = 1):
    return (
        db.query(Purchase)
        .filter(Purchase.id == purchase_id, Purchase.user_id == user_id)
        .first()
    )


def create_purchase(db: Session, purchase_data: PurchaseCreate, user_id: int = 1):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == purchase_data.supplier_id, Supplier.user_id == user_id)
        .first()
    )

    if not supplier:
        raise Exception("Supplier not found")

    total_amount = 0

    purchase = Purchase(
        supplier_id=purchase_data.supplier_id,
        total_amount=0,
        user_id=user_id,
    )

    db.add(purchase)
    db.flush()

    for item in purchase_data.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.user_id == user_id)
            .first()
        )

        if not product:
            raise Exception(f"Product {item.product_id} not found")

        subtotal = item.quantity * item.price
        total_amount += subtotal

        purchase_item = PurchaseItem(
            purchase_id=purchase.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
            subtotal=subtotal,
        )

        db.add(purchase_item)

        # Increase product quantity & sync Inventory
        product.quantity = (product.quantity or 0) + item.quantity
        inv = (
            db.query(Inventory)
            .filter(Inventory.product_id == item.product_id, Inventory.user_id == user_id)
            .first()
        )
        if inv:
            inv.quantity = product.quantity

    purchase.total_amount = total_amount

    db.commit()
    db.refresh(purchase)

    return purchase


def delete_purchase(db: Session, purchase_id: int, user_id: int = 1):
    purchase = (
        db.query(Purchase)
        .filter(Purchase.id == purchase_id, Purchase.user_id == user_id)
        .first()
    )

    if not purchase:
        raise Exception("Purchase not found")

    for item in purchase.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.user_id == user_id)
            .first()
        )

        if product:
            product.quantity = max(0, (product.quantity or 0) - item.quantity)
            inv = (
                db.query(Inventory)
                .filter(Inventory.product_id == item.product_id, Inventory.user_id == user_id)
                .first()
            )
            if inv:
                inv.quantity = product.quantity

    db.delete(purchase)
    db.commit()

    return {"message": "Purchase deleted successfully"}
