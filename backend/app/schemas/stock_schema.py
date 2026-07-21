from pydantic import BaseModel


class StockTransactionCreate(BaseModel):
    product_id: int
    quantity: int