from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.security import SECRET_KEY, ALGORITHM
from app.database.connection import get_db
from app.models.user_model import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        raise credentials_exception


def get_current_db_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Decodes the JWT and loads the matching User row from the database.
    Use this (instead of get_current_user) whenever the endpoint needs
    to read or modify the logged-in user's own record.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise credentials_exception

    return user


oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


def get_tenant_user(
    token: str = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> User:
    """
    Returns the authenticated tenant User based on the JWT Bearer token.
    If no token is supplied (e.g. unauthenticated demo preview), defaults to Demo Admin (user_id=1).
    """
    if token:
        try:
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
            )
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    return user
        except JWTError:
            pass

    # Fallback to Demo Admin (user_id=1)
    admin_user = db.query(User).filter(User.id == 1).first()
    if admin_user:
        return admin_user

    return db.query(User).first()


def require_roles(*allowed_roles: str):
    """
    FastAPI dependency factory to enforce Role-Based Access Control (RBAC).
    Usage:
        @router.get("/sensitive", dependencies=[Depends(require_roles("admin", "manager"))])
        or
        def my_route(current_user: User = Depends(require_roles("admin"))):
    """
    def role_checker(current_user: User = Depends(get_tenant_user)) -> User:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        allowed_normalized = [r.lower() for r in allowed_roles]
        if user_role.lower() not in allowed_normalized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: This module requires {', '.join(allowed_roles)} privileges (your role: {user_role}).",
            )
        return current_user

    return role_checker
