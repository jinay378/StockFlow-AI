from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user, require_roles
from app.models.product_model import Product
from app.models.inventory_model import Inventory
from app.schemas.product_schema import ProductCreate

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================================================
# CREATE PRODUCT
# =========================================================

@router.post("/")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    new_product = Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity,
        category_id=product.category_id,
        user_id=current_user.tenant_id,
    )

    db.add(new_product)
    db.flush()

    # Automatically create matching Inventory entry
    new_inv = Inventory(
        product_id=new_product.id,
        quantity=new_product.quantity,
        minimum_stock=10,
        warehouse="Main Central Warehouse",
        user_id=current_user.tenant_id,
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product added successfully",
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "sku": new_product.sku,
            "price": new_product.price,
            "quantity": new_product.quantity,
            "category_id": new_product.category_id,
            "user_id": new_product.user_id,
        }
    }


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@router.get("/")
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    products = db.query(Product).filter(Product.user_id == current_user.tenant_id).all()
    return products


# =========================================================
# GET SINGLE PRODUCT
# =========================================================

@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.tenant_id,
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# =========================================================
# UPDATE PRODUCT
# =========================================================

@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    existing_product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.tenant_id,
    ).first()

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing_product.name = product.name
    existing_product.sku = product.sku
    existing_product.price = product.price
    existing_product.quantity = product.quantity
    existing_product.category_id = product.category_id

    # Sync matching inventory record
    inv = db.query(Inventory).filter(
        Inventory.product_id == existing_product.id,
        Inventory.user_id == current_user.tenant_id
    ).first()
    if inv:
        inv.quantity = existing_product.quantity
    else:
        new_inv = Inventory(
            product_id=existing_product.id,
            quantity=existing_product.quantity,
            minimum_stock=10,
            warehouse="Main Central Warehouse",
            user_id=current_user.tenant_id
        )
        db.add(new_inv)

    db.commit()
    db.refresh(existing_product)

    return {
        "message": "Product updated successfully",
        "product": {
            "id": existing_product.id,
            "name": existing_product.name,
            "sku": existing_product.sku,
            "price": existing_product.price,
            "quantity": existing_product.quantity,
            "category_id": existing_product.category_id,
            "user_id": existing_product.user_id,
        }
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.tenant_id,
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Clean up associated inventory records
    db.query(Inventory).filter(
        Inventory.product_id == product.id,
        Inventory.user_id == current_user.tenant_id
    ).delete()

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }
