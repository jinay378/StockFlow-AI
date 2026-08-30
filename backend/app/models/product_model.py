from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.category_model import Category


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    sku = Column(String, unique=True)

    price = Column(Float)

    quantity = Column(Integer)

    category_id = Column(
        Integer,
        ForeignKey("categories.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        default=1,
        index=True
    )

    category = relationship("Category")