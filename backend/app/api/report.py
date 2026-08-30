from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user, require_roles

from app.services.report_service import (
    get_dashboard_summary,
    get_low_stock,
    get_inventory_report,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    return get_dashboard_summary(db, user_id=current_user.tenant_id)


@router.get("/low-stock")
def low_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_low_stock(db, user_id=current_user.tenant_id)


@router.get("/inventory")
def inventory_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    return get_inventory_report(db, user_id=current_user.tenant_id)
