from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product_model import Product
from app.models.sale_model import Sale, SaleItem


DEFAULT_LOOKBACK_DAYS = 30
DEFAULT_LEAD_TIME_DAYS = 14


def _urgency_for(current_stock: int, minimum_stock: int, days_of_stock_remaining):
    if current_stock <= 0:
        return "critical"

    if days_of_stock_remaining is not None and days_of_stock_remaining <= DEFAULT_LEAD_TIME_DAYS:
        return "high"

    if current_stock <= minimum_stock:
        return "medium"

    return "ok"


def get_reorder_suggestions(
    db: Session,
    lookback_days: int = DEFAULT_LOOKBACK_DAYS,
    lead_time_days: int = DEFAULT_LEAD_TIME_DAYS,
    user_id: int = 1,
):
    since = datetime.utcnow() - timedelta(days=lookback_days)

    sales_data = dict(
        db.query(
            SaleItem.product_id,
            func.coalesce(func.sum(SaleItem.quantity), 0),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= since, Sale.user_id == user_id)
        .group_by(SaleItem.product_id)
        .all()
    )

    rows = (
        db.query(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity,
        )
        .filter(Product.user_id == user_id)
        .all()
    )

    suggestions = []

    for product_id, name, sku, qty in rows:
        current_stock = qty or 0
        minimum_stock = 10

        units_sold = sales_data.get(product_id, 0)
        avg_daily_sales = round(units_sold / lookback_days, 2)

        if avg_daily_sales > 0:
            days_of_stock_remaining = round(current_stock / avg_daily_sales, 1)

            target_stock = (avg_daily_sales * lead_time_days) + minimum_stock
            suggested_qty = max(0, round(target_stock - current_stock))

        else:
            days_of_stock_remaining = None

            if current_stock <= minimum_stock:
                suggested_qty = max(0, (minimum_stock * 2) - current_stock)
            else:
                suggested_qty = 0

        urgency = _urgency_for(current_stock, minimum_stock, days_of_stock_remaining)

        suggestions.append({
            "product_id": product_id,
            "product_name": name,
            "sku": sku or f"SKU-{product_id}",
            "current_stock": current_stock,
            "minimum_stock": minimum_stock,
            "units_sold_last_n_days": units_sold,
            "avg_daily_sales": avg_daily_sales,
            "days_of_stock_remaining": days_of_stock_remaining,
            "suggested_reorder_quantity": suggested_qty,
            "urgency": urgency,
            "lookback_days": lookback_days,
            "assumed_lead_time_days": lead_time_days,
        })

    suggestions.sort(
        key=lambda s: (
            {"critical": 0, "high": 1, "medium": 2, "ok": 3}[s["urgency"]],
            s["days_of_stock_remaining"] if s["days_of_stock_remaining"] is not None else float("inf"),
        )
    )

    return suggestions
