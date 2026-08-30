from sqlalchemy import Column, Integer, String, ForeignKey

from app.database.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, nullable=False)

    phone = Column(String, nullable=False)

    address = Column(String, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)