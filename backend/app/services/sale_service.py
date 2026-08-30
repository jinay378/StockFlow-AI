from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.sale_model import Sale, SaleItem
from app.models.customer_model import Customer
from app.models.product_model import Product
from app.models.inventory_model import Inventory
from app.models.stock_transaction_model import StockTransaction
from app.schemas.sale_schema import SaleCreate


def get_all_sales(db: Session, user_id: int = 1):
    return (
        db.query(Sale)
        .filter(Sale.user_id == user_id)
        .order_by(Sale.created_at.desc())
        .all()
    )


def get_sale_by_id(db: Session, sale_id: int, user_id: int = 1):
    sale = (
        db.query(Sale)
        .filter(Sale.id == sale_id, Sale.user_id == user_id)
        .first()
    )

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    return sale


def create_sale(db: Session, sale_data: SaleCreate, user_id: int = 1):
    # Check customer
    customer = (
        db.query(Customer)
        .filter(Customer.id == sale_data.customer_id, Customer.user_id == user_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    total_amount = 0.0

    sale = Sale(
        customer_id=sale_data.customer_id,
        total_amount=0.0,
        user_id=user_id,
    )

    db.add(sale)
    db.flush()

    for item in sale_data.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.user_id == user_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == item.product_id, Inventory.user_id == user_id)
            .first()
        )

        # Check stock availability against product quantity
        avail_stock = product.quantity if product.quantity is not None else 0
        if avail_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name} (Available: {avail_stock}, Requested: {item.quantity})"
            )

        price = float(product.price or 0)
        subtotal = float(price * item.quantity)

        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=item.quantity,
            price=price,
            subtotal=subtotal
        )

        db.add(sale_item)

        # Deduct from Product & Sync with Inventory
        product.quantity = max(0, avail_stock - item.quantity)
        if inventory:
            inventory.quantity = product.quantity

        # Record stock transaction
        tx = StockTransaction(
            product_id=product.id,
            transaction_type="OUT",
            quantity=item.quantity,
            user_id=user_id,
        )
        db.add(tx)

        total_amount += subtotal

    sale.total_amount = total_amount

    db.commit()
    db.refresh(sale)

    return sale


def delete_sale(db: Session, sale_id: int, user_id: int = 1):
    sale = (
        db.query(Sale)
        .filter(Sale.id == sale_id, Sale.user_id == user_id)
        .first()
    )

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    for item in sale.items:
        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == item.product_id, Inventory.user_id == user_id)
            .first()
        )

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.user_id == user_id)
            .first()
        )

        if product:
            product.quantity = (product.quantity or 0) + item.quantity
            if inventory:
                inventory.quantity = product.quantity

        tx = StockTransaction(
            product_id=item.product_id,
            transaction_type="IN",
            quantity=item.quantity,
            user_id=user_id,
        )
        db.add(tx)

    db.delete(sale)
    db.commit()

    return {
        "message": "Sale deleted successfully"
    }
