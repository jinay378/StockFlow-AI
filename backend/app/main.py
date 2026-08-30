from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.base import Base

# Models
from app.models.user_model import User
from app.models.category_model import Category
from app.models.product_model import Product
from app.models.supplier_model import Supplier
from app.models.stock_transaction_model import StockTransaction
from app.models.stock_adjustment_model import StockAdjustment
from app.models.customer_model import Customer
from app.models.purchase_model import Purchase, PurchaseItem

# Routers
from app.api.auth import router as auth_router
from app.api.category import router as category_router
from app.api.product import router as product_router
from app.api.supplier import router as supplier_router
from app.api.stock import router as stock_router
from app.api.stock_adjustment import router as stock_adjustment_router
from app.api.dashboard import router as dashboard_router
from app.api.reorder import router as reorder_router

from app.api import inventory
from app.api import customer
from app.api import report
from app.api import sale
from app.api import purchase
from app.api import ai

# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)

# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="StockFlow AI API",
    version="1.0.0",
)

# =========================================================
# CORS CONFIGURATION (PRODUCTION & LOCAL)
# =========================================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(supplier_router)
app.include_router(stock_router)
app.include_router(stock_adjustment_router)
app.include_router(dashboard_router)
app.include_router(reorder_router)

app.include_router(inventory.router)
app.include_router(customer.router)
app.include_router(report.router)
app.include_router(sale.router)
app.include_router(purchase.router)
app.include_router(ai.router)

# =========================================================
# LIFECYCLE / STARTUP EVENT
# =========================================================

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    try:
        from seed_data import seed_if_empty
        seed_if_empty()
    except Exception as e:
        print(f"Startup initialization note: {e}")

# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():
    return {
        "message": "Welcome to StockFlow AI Backend 🚀"
    }