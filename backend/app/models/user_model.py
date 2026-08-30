from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.database.base import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    phone = Column(String, default="+91 98765 43210", nullable=True)

    otp_code = Column(String, nullable=True)

    otp_expires_at = Column(DateTime, nullable=True)

    otp_attempts = Column(Integer, default=0, nullable=True)

    role = Column(
        Enum(UserRole),
        default=UserRole.staff,
        nullable=False,
    )

    company_id = Column(Integer, nullable=True)

    @property
    def tenant_id(self) -> int:
        """
        Returns the primary organization/tenant ID.
        If this user is a staff member with company_id set, returns company_id.
        Otherwise returns the user's own id (company owner/admin).
        """
        return self.company_id if self.company_id is not None else self.id