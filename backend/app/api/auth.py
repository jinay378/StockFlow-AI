from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.schemas.user_schema import UserLogin
from app.services.auth_service import login_user
from app.database.connection import get_db
from app.schemas.user_schema import UserCreate
from app.services.auth_service import create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    created_user = create_user(db, user)

    if created_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message": "User registered successfully",
        "id": created_user.id,
        "username": created_user.username,
        "email": created_user.email
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    result = login_user(db, user.email, user.password)

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "username": result["user"].username,
        "email": result["user"].email
    }