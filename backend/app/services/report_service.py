from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.product_model import Product
from app.models.category_model import Category
from app.models.supplier_model import Supplier
from app.models.customer_model import Customer
from app.models.inventory_model import Inventory


def get_dashboard_summary(db: Session, user_id: int = 1):
    total_products = db.query(func.count(Product.id)).filter(Product.user_id == user_id).scalar() or 0
    total_categories = db.query(func.count(Category.id)).filter(Category.user_id == user_id).scalar() or 0
    total_suppliers = db.query(func.count(Supplier.id)).filter(Supplier.user_id == user_id).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).filter(Customer.user_id == user_id).scalar() or 0
    inventory_items = db.query(func.count(Product.id)).filter(Product.user_id == user_id).scalar() or 0
    low_stock_items = db.query(Product).filter(Product.user_id == user_id, Product.quantity < 10).count()

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_suppliers": total_suppliers,
        "total_customers": total_customers,
        "inventory_items": inventory_items,
        "low_stock_items": low_stock_items,
    }


def get_low_stock(db: Session, user_id: int = 1):
    items = (
        db.query(Product)
        .filter(Product.user_id == user_id, Product.quantity < 10)
        .all()
    )

    result = []
    for item in items:
        result.append({
            "id": item.id,
            "product": item.name,
            "quantity": item.quantity or 0,
            "minimum_stock": 10,
            "warehouse": "Main Warehouse",
        })

    return result


def get_inventory_report(db: Session, user_id: int = 1):
    products = db.query(Product).filter(Product.user_id == user_id).all()

    result = []
    for item in products:
        result.append({
            "id": item.id,
            "product": item.name,
            "quantity": item.quantity or 0,
            "minimum_stock": 10,
            "warehouse": "Main Warehouse",
        })

    return result
