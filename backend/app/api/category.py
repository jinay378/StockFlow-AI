from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.category_schema import CategoryCreate

from app.services.category_service import (
    create_category,
    get_categories,
    get_category,
    update_category,
    delete_category,
)

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/")
def add_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):

    new_category = create_category(db, category)

    if new_category is None:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    return {
        "message": "Category created successfully",
        "id": new_category.id,
        "name": new_category.name,
    }


@router.get("/")
def all_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.get("/{category_id}")
def category(category_id: int, db: Session = Depends(get_db)):
    return get_category(db, category_id)


@router.put("/{category_id}")
def update(
    category_id: int,
    category: CategoryCreate,
    db: Session = Depends(get_db),
):

    updated = update_category(
        db,
        category_id,
        category,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return {
        "message": "Category updated successfully"
    }


@router.delete("/{category_id}")
def delete(
    category_id: int,
    db: Session = Depends(get_db),
):

    deleted = delete_category(db, category_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return {
        "message": "Category deleted successfully"
    }