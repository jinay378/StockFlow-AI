from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate
from app.models.user_model import User
from app.database.connection import get_db
from app.core.security import hash_password

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully!",
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email
    }