from sqlalchemy.orm import Session
from app.models.product_model import Product
from app.models.category_model import Category
from app.models.supplier_model import Supplier

def get_dashboard(db: Session):

    total_products = db.query(Product).count()
    total_categories = db.query(Category).count()
    total_suppliers = db.query(Supplier).count()

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_suppliers": total_suppliers
    }