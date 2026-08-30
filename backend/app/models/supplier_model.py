from sqlalchemy import Column, Integer, String, ForeignKey

from app.database.base import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)