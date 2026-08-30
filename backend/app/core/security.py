import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "StockFlow_Super_Secure_JWT_Key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return plain_password == hashed_password


def create_access_token(user):
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_temp_otp_token(user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=5)
    payload = {
        "sub": str(user_id),
        "type": "otp_pending",
        "exp": expire,
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_temp_otp_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "otp_pending":
            return None
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except Exception:
        return None


def create_password_reset_token(user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=10)
    payload = {
        "sub": str(user_id),
        "type": "password_reset_pending",
        "exp": expire,
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_password_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset_pending":
            return None
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except Exception:
        return None