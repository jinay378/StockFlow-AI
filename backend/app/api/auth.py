from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.user_schema import (
    UserLogin,
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    LoginStepOneResponse,
    VerifyOtpResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResendResetOtpRequest,
    ResetPasswordRequest,
    TeamMemberCreate,
    TeamMemberUpdateRole,
)
from app.services.auth_service import (
    login_user,
    verify_user_otp,
    resend_user_otp,
    direct_login_for_swagger,
    create_user,
    update_user_profile,
    change_user_password,
    forgot_password_request,
    resend_password_reset_otp,
    reset_password_with_otp,
)
from app.database.connection import get_db
from app.core.security import hash_password
from app.core.dependencies import get_current_db_user, require_roles
from app.models.user_model import User

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
        "email": created_user.email,
        "phone": created_user.phone,
        "role": created_user.role,
    }


@router.post("/login", response_model=LoginStepOneResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Step 1: Validate email and password.
    If valid, generates and dispatches a 6-digit OTP to the registered mobile number.
    """
    result = login_user(db, user.email, user.password)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return result


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Step 2: Validate the 6-digit OTP before granting access to company data.
    """
    status_code, result = verify_user_otp(db, payload.temp_token, payload.otp_code)

    if status_code != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result
        )

    return result


@router.post("/resend-otp")
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    """
    Resends a fresh 6-digit OTP to the user's registered phone number.
    """
    status_code, result = resend_user_otp(db, payload.temp_token)

    if status_code != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result
        )

    return result


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 compatible token login for Swagger UI authorization."""
    result = direct_login_for_swagger(db, form_data.username, form_data.password)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_db_user),
):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
):
    updated_user = update_user_profile(
        db, current_user, payload.username, payload.phone
    )

    return updated_user


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_db_user),
):
    result = change_user_password(
        db,
        current_user,
        payload.old_password,
        payload.new_password,
    )

    if result == "invalid_old_password":
        raise HTTPException(
            status_code=400,
            detail="Old password is incorrect"
        )

    return {"message": "Password changed successfully"}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Step 1: User submits their registered email.
    Generates and dispatches a 6-digit verification code to the email address.
    """
    result = forgot_password_request(db, payload.email)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )

    return result


@router.post("/resend-reset-otp")
def resend_reset_otp(
    payload: ResendResetOtpRequest,
    db: Session = Depends(get_db),
):
    """
    Resends a fresh 6-digit OTP to the user's email for password recovery.
    """
    status_code, result = resend_password_reset_otp(db, payload.reset_token)

    if status_code != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result
        )

    return result


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Step 2: Validates the 6-digit OTP and updates the user's password.
    """
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    status_code, result = reset_password_with_otp(
        db,
        payload.reset_token,
        payload.otp_code,
        payload.new_password,
    )

    if status_code != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result
        )

    return result


# =========================================================
# TEAM MEMBERS & ROLE MANAGEMENT (Admin/Manager)
# =========================================================

@router.get("/team")
def get_company_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    """
    Returns all team members belonging to this company/organization.
    """
    tenant_id = current_user.tenant_id
    # Team members are either the owner (id == tenant_id) or staff with company_id == tenant_id
    members = (
        db.query(User)
        .filter((User.id == tenant_id) | (User.company_id == tenant_id))
        .all()
    )

    return [
        {
            "id": m.id,
            "username": m.username,
            "email": m.email,
            "phone": m.phone,
            "role": m.role.value if hasattr(m.role, "value") else str(m.role),
            "is_owner": m.id == tenant_id,
        }
        for m in members
    ]


@router.post("/team")
def add_team_member(
    payload: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """
    Admin can create and link a new Staff/Manager member directly to their company.
    """
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists."
        )

    new_member = User(
        username=payload.username.strip(),
        email=payload.email.lower().strip(),
        password=hash_password(payload.password),
        phone=payload.phone or "+91 98765 43210",
        role=payload.role,
        company_id=current_user.tenant_id,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {
        "message": f"Team member {new_member.username} ({new_member.role.value}) added successfully.",
        "member": {
            "id": new_member.id,
            "username": new_member.username,
            "email": new_member.email,
            "phone": new_member.phone,
            "role": new_member.role.value if hasattr(new_member.role, "value") else str(new_member.role),
            "is_owner": False,
        }
    }


@router.put("/team/{member_id}/role")
def update_team_member_role(
    member_id: int,
    payload: TeamMemberUpdateRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """
    Admin can change a team member's role (admin, manager, staff).
    """
    member = db.query(User).filter(
        User.id == member_id,
        User.company_id == current_user.tenant_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Team member not found in your company.")

    member.role = payload.role
    db.commit()
    db.refresh(member)

    return {
        "message": f"Role updated to {member.role.value}.",
        "member": {
            "id": member.id,
            "username": member.username,
            "email": member.email,
            "role": member.role.value if hasattr(member.role, "value") else str(member.role),
        }
    }


@router.delete("/team/{member_id}")
def remove_team_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """
    Admin can remove a staff member from the company.
    """
    member = db.query(User).filter(
        User.id == member_id,
        User.company_id == current_user.tenant_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Team member not found in your company.")

    db.delete(member)
    db.commit()

    return {"message": "Team member removed from company."}


