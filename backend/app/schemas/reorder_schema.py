from pydantic import BaseModel


class ReorderSuggestion(BaseModel):
    product_id: int
    product_name: str
    sku: str | None = None
    current_stock: int
    minimum_stock: int
    avg_daily_sales: float
    days_of_stock_remaining: float | None = None
    suggested_reorder_qty: int
    urgency: str
