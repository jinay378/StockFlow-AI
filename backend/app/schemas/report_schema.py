from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_products: int
    total_categories: int
    total_suppliers: int
    total_customers: int
    inventory_items: int
    low_stock_items: int


class InventoryReportItem(BaseModel):
    id: int
    product: str
    quantity: int
    minimum_stock: int
    warehouse: str


class LowStockItem(BaseModel):
    id: int
    product: str
    quantity: int
    minimum_stock: int
    warehouse: str