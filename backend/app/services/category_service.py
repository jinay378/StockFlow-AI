from typing import Optional
from sqlalchemy.orm import Session

from app.models.category_model import Category
from app.schemas.category_schema import CategoryCreate


def create_category(db: Session, category: CategoryCreate, user_id: int = 1):
    existing = db.query(Category).filter(
        Category.name == category.name,
        Category.user_id == user_id,
    ).first()

    if existing:
        return None

    new_category = Category(
        name=category.name,
        description=category.description,
        user_id=user_id,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


def get_categories(db: Session, user_id: int = 1):
    return db.query(Category).filter(Category.user_id == user_id).all()


def get_category(db: Session, category_id: int, user_id: int = 1):
    return (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )


def update_category(
    db: Session,
    category_id: int,
    category: CategoryCreate,
    user_id: int = 1,
):
    existing = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )

    if not existing:
        return None

    existing.name = category.name
    existing.description = category.description

    db.commit()
    db.refresh(existing)

    return existing


def delete_category(db: Session, category_id: int, user_id: int = 1):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )

    if not category:
        return False

    db.delete(category)
    db.commit()

    return True
