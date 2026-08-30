from pydantic import BaseModel


class InventoryCreate(BaseModel):
    product_id: int
    quantity: int
    minimum_stock: int
    warehouse: str