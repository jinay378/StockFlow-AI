from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"))

    quantity = Column(Integer, nullable=False)

    transaction_type = Column(String, nullable=False)  # IN / OUT

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")