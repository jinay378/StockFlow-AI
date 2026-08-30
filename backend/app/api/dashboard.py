from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user
from app.models.product_model import Product
from app.models.sale_model import Sale
from app.services.dashboard_service import (
    get_dashboard,
    get_monthly_sales,
    get_monthly_purchases,
    get_category_distribution,
    get_recent_sales,
    get_low_stock_products,
    get_low_stock_alerts,
    get_inventory_analytics,
    get_top_selling_products,
    get_best_customers,
    get_sales_by_category,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def dashboard(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_dashboard(db, period, user_id=current_user.tenant_id)


@router.get("/summary")
def get_dashboard_summary(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    base_data = get_dashboard(db, period, user_id=current_user.tenant_id)
    return base_data


@router.get("/monthly-sales")
def monthly_sales(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_monthly_sales(db, period, user_id=current_user.tenant_id)


@router.get("/monthly-purchases")
def monthly_purchases(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_monthly_purchases(db, period, user_id=current_user.tenant_id)


@router.get("/category-distribution")
def category_distribution(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_category_distribution(db, period, user_id=current_user.tenant_id)


@router.get("/recent-sales")
def recent_sales(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_recent_sales(db, period, user_id=current_user.tenant_id)


@router.get("/low-stock-products")
def low_stock_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_low_stock_products(db, user_id=current_user.tenant_id)


@router.get("/low-stock-alerts")
def low_stock_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_low_stock_alerts(db, user_id=current_user.tenant_id)


@router.get("/inventory-analytics")
def inventory_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_inventory_analytics(db, user_id=current_user.tenant_id)


@router.get("/top-selling-products")
def top_selling_products(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_top_selling_products(db, period, user_id=current_user.tenant_id)


@router.get("/best-customers")
def best_customers(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_best_customers(db, period, user_id=current_user.tenant_id)


@router.get("/sales-by-category")
def sales_by_category(
    period: str = Query(default="all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_sales_by_category(db, period, user_id=current_user.tenant_id)
