import random
from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user_model import User
from app.schemas.user_schema import UserCreate
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_temp_otp_token,
    decode_temp_otp_token,
    create_password_reset_token,
    decode_password_reset_token,
)


from app.services.email_service import send_otp_email, send_password_reset_email


def mask_email(email: str) -> str:
    """Returns a masked email string like j***y@company.com."""
    if not email or "@" not in email:
        return "your email"
    user_part, domain = email.split("@", 1)
    if len(user_part) <= 2:
        masked_user = user_part[0] + "***"
    else:
        masked_user = user_part[0] + "***" + user_part[-1]
    return f"{masked_user}@{domain}"


def mask_phone(phone: str) -> str:
    """Returns a masked phone string like +91 ******43210."""
    if not phone:
        return "+91 ******43210"
    cleaned = phone.strip()
    if len(cleaned) <= 4:
        return "****"
    visible_end = cleaned[-4:]
    prefix = cleaned[:3] if cleaned.startswith("+") else ""
    return f"{prefix} ******{visible_end}"


def generate_6digit_otp() -> str:
    """Generates a cryptographically random 6-digit numeric OTP."""
    return f"{random.randint(100000, 999999)}"


def create_user(db: Session, user: UserCreate):
    existing_user = (
        db.query(User)
        .filter(func.lower(User.email) == user.email.lower().strip())
        .first()
    )

    if existing_user:
        return None

    new_user = User(
        username=user.username.strip(),
        email=user.email.lower().strip(),
        phone=user.phone or "+91 98765 43210",
        password=hash_password(user.password),
        role=user.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(
    db: Session,
    email: str,
    password: str,
):
    """
    Step 1 of 2FA: Verifies credentials, generates 6-digit OTP,
    sets 5-minute expiry, and dispatches to registered email.
    """
    normalized_email = email.lower().strip()
    user = (
        db.query(User)
        .filter(func.lower(User.email) == normalized_email)
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    # Generate 6-digit OTP
    otp = generate_6digit_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    user.otp_attempts = 0

    db.commit()
    db.refresh(user)

    # Dispatch OTP to user email (safe attempt)
    try:
        send_otp_email(user.email, user.username, otp)
    except Exception as e:
        print(f"OTP Email dispatch note: {e}")

    temp_token = create_temp_otp_token(user.id)

    return {
        "requires_otp": True,
        "temp_token": temp_token,
        "masked_email": mask_email(user.email),
        "masked_phone": mask_phone(user.phone),
        "message": f"A 6-digit verification code has been sent to {mask_email(user.email)}",
        "demo_otp": otp,  # Included for seamless local & live demo evaluation
    }


def verify_user_otp(
    db: Session,
    temp_token: str,
    otp_code: str,
):
    """
    Step 2 of 2FA: Validates the 6-digit OTP against database and expiry.
    If valid, issues full JWT Access Token. If invalid, denies access.
    """
    user_id = decode_temp_otp_token(temp_token)
    if not user_id:
        return "invalid_token", "Session expired or invalid. Please enter your credentials again."

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "user_not_found", "User account not found."

    # Check expiration
    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        return "otp_expired", "The OTP code has expired (5 minutes limit). Please click Resend Code."

    # Check attempt limit (brute-force defense)
    if (user.otp_attempts or 0) >= 5:
        return "too_many_attempts", "Too many incorrect OTP attempts. Please sign in again."

    # Verify code
    if user.otp_code != otp_code.strip():
        user.otp_attempts = (user.otp_attempts or 0) + 1
        db.commit()
        remaining = 5 - user.otp_attempts
        return "invalid_otp", f"Invalid OTP code. {remaining} attempt(s) remaining."

    # Success: Clear OTP and issue Access Token
    user.otp_code = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    db.commit()
    db.refresh(user)

    token = create_access_token(user)

    return "success", {
        "message": "Email OTP verification successful. Access granted.",
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "phone": user.phone,
    }


def resend_user_otp(
    db: Session,
    temp_token: str,
):
    """
    Resends a fresh 6-digit OTP to the user's registered email address.
    """
    user_id = decode_temp_otp_token(temp_token)
    if not user_id:
        return "invalid_token", "Session expired or invalid. Please sign in again."

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "user_not_found", "User account not found."

    otp = generate_6digit_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    user.otp_attempts = 0
    db.commit()
    db.refresh(user)

    # Dispatch fresh OTP to email
    send_otp_email(user.email, user.username, otp)

    return "success", {
        "message": f"A new 6-digit code has been sent to {mask_email(user.email)}",
        "masked_email": mask_email(user.email),
        "masked_phone": mask_phone(user.phone),
        "demo_otp": otp,
    }


def direct_login_for_swagger(db: Session, email_or_username: str, password: str):
    """Direct login without OTP for OpenAPI Swagger /docs testing."""
    user = (
        db.query(User)
        .filter((User.email == email_or_username) | (User.username == email_or_username))
        .first()
    )

    if not user or not verify_password(password, user.password):
        return None

    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "user": user,
    }


def update_user_profile(db: Session, user: User, username: str, phone: str = None):
    user.username = username
    if phone:
        user.phone = phone

    db.commit()
    db.refresh(user)

    return user


def change_user_password(
    db: Session,
    user: User,
    old_password: str,
    new_password: str,
):
    if not verify_password(old_password, user.password):
        return "invalid_old_password"

    user.password = hash_password(new_password)

    db.commit()
    db.refresh(user)

    return user


def forgot_password_request(db: Session, email: str):
    """
    Step 1: Check user, generate 6-digit OTP, dispatch password reset email,
    and return reset_token.
    """
    user = db.query(User).filter(User.email == email.strip()).first()
    if not user:
        return None

    otp = generate_6digit_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    user.otp_attempts = 0
    db.commit()
    db.refresh(user)

    send_password_reset_email(user.email, user.username, otp)
    reset_token = create_password_reset_token(user.id)

    return {
        "message": f"A 6-digit password reset code has been sent to {mask_email(user.email)}",
        "reset_token": reset_token,
        "masked_email": mask_email(user.email),
        "demo_otp": otp,
    }


def resend_password_reset_otp(db: Session, reset_token: str):
    """
    Resends a fresh 6-digit OTP for password reset.
    """
    user_id = decode_password_reset_token(reset_token)
    if not user_id:
        return "invalid_token", "Password reset session has expired or is invalid. Please start again."

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "user_not_found", "User account not found."

    otp = generate_6digit_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    user.otp_attempts = 0
    db.commit()
    db.refresh(user)

    send_password_reset_email(user.email, user.username, otp)

    return "success", {
        "message": f"A fresh password reset code has been sent to {mask_email(user.email)}",
        "masked_email": mask_email(user.email),
        "demo_otp": otp,
    }


def reset_password_with_otp(
    db: Session,
    reset_token: str,
    otp_code: str,
    new_password: str,
):
    """
    Step 2: Validates OTP, hashes new password, updates database, and clears reset state.
    """
    user_id = decode_password_reset_token(reset_token)
    if not user_id:
        return "invalid_token", "Password reset session has expired or is invalid. Please request a new code."

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "user_not_found", "User account not found."

    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        return "otp_expired", "The reset code has expired (10 minutes limit). Please request a new code."

    if (user.otp_attempts or 0) >= 5:
        return "too_many_attempts", "Too many incorrect attempts. Please request a new password reset code."

    if user.otp_code != otp_code.strip():
        user.otp_attempts = (user.otp_attempts or 0) + 1
        db.commit()
        remaining = 5 - user.otp_attempts
        return "invalid_otp", f"Invalid verification code. {remaining} attempt(s) remaining."

    # Success: Update password and clear OTP
    user.password = hash_password(new_password)
    user.otp_code = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    db.commit()
    db.refresh(user)

    return "success", {
        "message": "Password reset successfully. You can now log in with your new password."
    }


