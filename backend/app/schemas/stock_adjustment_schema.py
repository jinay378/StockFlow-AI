from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StockAdjustmentCreate(BaseModel):
    product_id: int
    quantity: int
    adjustment_type: str  # "INCREASE" or "DECREASE"
    reason: str


class StockAdjustmentOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    adjustment_type: str
    reason: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
