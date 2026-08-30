from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone: Optional[str] = "+91 98765 43210"
    role: UserRole = UserRole.staff


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class VerifyOtpRequest(BaseModel):
    temp_token: str
    otp_code: str


class ResendOtpRequest(BaseModel):
    temp_token: str


class LoginStepOneResponse(BaseModel):
    requires_otp: bool = True
    temp_token: str
    masked_email: str
    masked_phone: Optional[str] = None
    message: str
    demo_otp: Optional[str] = None


class VerifyOtpResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str
    role: str
    phone: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: str
    phone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str
    masked_email: str
    demo_otp: Optional[str] = None


class ResendResetOtpRequest(BaseModel):
    reset_token: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    otp_code: str
    new_password: str


class TeamMemberCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone: Optional[str] = "+91 98765 43210"
    role: UserRole = UserRole.staff


class TeamMemberUpdateRole(BaseModel):
    role: UserRole


