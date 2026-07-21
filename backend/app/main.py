from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
from app.database.base import Base

from app.models.user_model import User
from app.models.category_model import Category
from app.models.product_model import Product

from app.api.auth import router as auth_router
from app.api.category import router as category_router
from app.api.product import router as product_router

from app.models.supplier_model import Supplier
from app.api.supplier import router as supplier_router

from app.models.stock_transaction_model import StockTransaction

from app.api.stock import router as stock_router

from app.api.dashboard import router as dashboard_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="StockFlow AI API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(supplier_router)
app.include_router(stock_router)
app.include_router(dashboard_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to StockFlow AI Backend 🚀"
    }

