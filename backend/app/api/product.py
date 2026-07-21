from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.product_schema import ProductCreate

from app.services.product_service import (
    create_product,
    get_products,
    get_product,
    update_product,
    delete_product,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/")
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    product = create_product(db, product)
    return {
        "message": "Product created successfully",
        "id": product.id,
        "name": product.name,
    }


@router.get("/")
def all_products(db: Session = Depends(get_db)):
    return get_products(db)


@router.get("/{product_id}")
def product(product_id: int, db: Session = Depends(get_db)):
    return get_product(db, product_id)


@router.put("/{product_id}")
def update(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    updated = update_product(db, product_id, product)

    if not updated:
        return {"message": "Product not found"}

    return {"message": "Product updated successfully"}


@router.delete("/{product_id}")
def delete(product_id: int, db: Session = Depends(get_db)):
    deleted = delete_product(db, product_id)

    if not deleted:
        return {"message": "Product not found"}

    return {"message": "Product deleted successfully"}