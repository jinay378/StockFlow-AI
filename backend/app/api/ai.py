from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user
from app.services.ai_service import ask_ai, get_ai_insights

router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"],
)

class AIChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_with_ai(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return ask_ai(db, req.message, user_id=current_user.tenant_id)

@router.get("/insights")
def ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_ai_insights(db, user_id=current_user.tenant_id)
