from sqlalchemy.orm import Session
from app.models.product_model import Product


def create_product(db: Session, product):

    new_product = Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity,
        category_id=product.category_id,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


def get_products(db: Session):
    return db.query(Product).all()


def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()


def update_product(db: Session, product_id: int, product):

    existing_product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not existing_product:
        return None

    existing_product.name = product.name
    existing_product.sku = product.sku
    existing_product.price = product.price
    existing_product.quantity = product.quantity
    existing_product.category_id = product.category_id

    db.commit()
    db.refresh(existing_product)

    return existing_product


def delete_product(db: Session, product_id: int):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        return False

    db.delete(product)
    db.commit()

    return True