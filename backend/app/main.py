from fastapi import FastAPI

from app.database.connection import engine
from app.database.base import Base
from app.models.user_model import User

from app.api.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StockFlow AI API",
    version="1.0.0"
)

app.include_router(auth_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to StockFlow AI Backend 🚀"
    }