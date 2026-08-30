from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False)

    minimum_stock = Column(Integer, default=0)

    warehouse = Column(String, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)

    product = relationship("Product")