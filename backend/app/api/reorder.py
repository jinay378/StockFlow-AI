from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user
from app.services.reorder_service import (
    get_reorder_suggestions,
    DEFAULT_LOOKBACK_DAYS,
    DEFAULT_LEAD_TIME_DAYS,
)

router = APIRouter(
    prefix="/reorder",
    tags=["AI Reorder Suggestions"],
)


@router.get("/suggestions")
def reorder_suggestions(
    lookback_days: int = Query(default=DEFAULT_LOOKBACK_DAYS),
    lead_time_days: int = Query(default=DEFAULT_LEAD_TIME_DAYS),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_reorder_suggestions(db, lookback_days, lead_time_days, user_id=current_user.tenant_id)
