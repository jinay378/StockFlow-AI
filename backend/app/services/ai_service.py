import os
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.product_model import Product
from app.models.sale_model import Sale, SaleItem
from app.services.reorder_service import get_reorder_suggestions
from app.services.dashboard_service import get_low_stock_alerts, get_dashboard


def generate_database_context(db: Session, user_id: int = 1) -> dict:
    """Collects real-time snapshot of the inventory database for AI reasoning."""
    total_products = db.query(Product).filter(Product.user_id == user_id).count()
    low_stock_count = db.query(Product).filter(Product.user_id == user_id, Product.quantity < 10).count()
    total_sales = db.query(func.coalesce(func.sum(Sale.total_amount), 0)).filter(Sale.user_id == user_id).scalar() or 0
    total_orders = db.query(Sale).filter(Sale.user_id == user_id).count()

    # Top 5 products by sales
    top_selling = (
        db.query(Product.name, func.sum(SaleItem.quantity).label("units_sold"))
        .join(SaleItem, Product.id == SaleItem.product_id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.user_id == user_id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(5)
        .all()
    )

    # Low stock alerts
    alerts = get_low_stock_alerts(db, user_id=user_id)

    # Reorder suggestions
    reorder = get_reorder_suggestions(db, lookback_days=30, lead_time_days=14, user_id=user_id)
    actionable_reorders = [r for r in reorder if r.get("suggested_reorder_quantity", 0) > 0]

    return {
        "total_products": total_products,
        "low_stock_count": low_stock_count,
        "total_sales_revenue": float(total_sales),
        "total_orders": total_orders,
        "top_selling": [{"product": name, "units": int(units or 0)} for name, units in top_selling],
        "alerts_count": len(alerts),
        "critical_alerts": [a["product"] for a in alerts if a.get("severity") == "critical"],
        "high_alerts": [a["product"] for a in alerts if a.get("severity") == "high"],
        "reorder_count": len(actionable_reorders),
        "reorder_recommendations": [
            f"{r['product_name']} (Reorder {r['suggested_reorder_quantity']} units, ~{r['days_of_stock_remaining']} days left)"
            for r in actionable_reorders[:4]
        ],
    }


def ask_ai(db: Session, message: str, user_id: int = 1) -> dict:
    context = generate_database_context(db, user_id=user_id)
    msg_lower = message.strip().lower()

    if any(k in msg_lower for k in ["low stock", "running low", "out of stock", "alert"]):
        if context["low_stock_count"] == 0:
            reply = "🎉 Excellent news! All products are currently stocked above their minimum safety thresholds."
        else:
            critical = context["critical_alerts"]
            high = context["high_alerts"]
            items_str = ""
            if critical:
                items_str += f"\n• 🚨 **Out of Stock**: {', '.join(critical)}"
            if high:
                items_str += f"\n• ⚠️ **Critically Low**: {', '.join(high)}"
            reply = f"There are **{context['low_stock_count']} products** currently at or below minimum threshold:{items_str}\n\nCheck the **Low Stock Alerts** page for urgent replenishment."

    elif any(k in msg_lower for k in ["reorder", "suggest", "order", "replenish", "forecast"]):
        if context["reorder_count"] == 0:
            reply = "📦 Stock levels appear well-balanced for current sales velocity across all product lines. No immediate reorders needed."
        else:
            reorders_list = "\n".join([f"• {rec}" for rec in context["reorder_recommendations"]])
            reply = f"Based on moving-average sales run-rate and supplier lead times, here are the top restock recommendations:\n\n{reorders_list}\n\nVisit the **AI Reorder** page for granular lead-time tuning."

    elif any(k in msg_lower for k in ["sale", "revenue", "income", "money", "total"]):
        reply = f"📊 **Sales Summary**:\n• Total Orders: **{context['total_orders']}**\n• Total Recorded Revenue: **₹{context['total_sales_revenue']:,.2f}**\n• Active Catalog SKUs: **{context['total_products']}**"

    elif any(k in msg_lower for k in ["best", "top", "popular", "fast"]):
        if context["top_selling"]:
            top_str = "\n".join([f"• **{item['product']}**: {item['units']} units sold" for item in context["top_selling"]])
            reply = f"🏆 **Top Selling Products**:\n{top_str}"
        else:
            reply = "No product sales recorded yet. Once you complete sales orders, best sellers will appear here."

    elif any(k in msg_lower for k in ["hi", "hello", "hey", "help", "who are you"]):
        reply = (
            "👋 Hello! I am **StockFlow Copilot**, your AI inventory assistant.\n\n"
            "I can help you monitor stock levels, forecast reorders, analyze sales performance, and optimize supply chain efficiency. What would you like to check today?"
        )

    else:
        reply = (
            f"Here is your current inventory summary:\n"
            f"• Products in catalog: **{context['total_products']}**\n"
            f"• Low stock alerts: **{context['low_stock_count']}**\n"
            f"• Total revenue: **₹{context['total_sales_revenue']:,.2f}**\n"
            f"• Actionable reorders: **{context['reorder_count']}**\n\n"
            f"Feel free to ask me for specific forecasts, best sellers, or supplier reorders!"
        )

    return {
        "reply": reply,
        "context_snapshot": context,
    }


def get_ai_insights(db: Session, user_id: int = 1) -> dict:
    context = generate_database_context(db, user_id=user_id)
    insights = []

    if context["low_stock_count"] > 0:
        insights.append({
            "type": "warning",
            "title": "Low Stock Warning",
            "description": f"{context['low_stock_count']} items require restocking to prevent stockouts.",
        })

    if context["reorder_count"] > 0:
        insights.append({
            "type": "info",
            "title": "Automated Reorder Suggestions",
            "description": f"{context['reorder_count']} items have upcoming stock replenishment recommendations.",
        })

    if context["total_sales_revenue"] > 0:
        insights.append({
            "type": "success",
            "title": "Revenue Performance",
            "description": f"Total revenue generated is ₹{context['total_sales_revenue']:,.2f} across {context['total_orders']} orders.",
        })

    return {
        "insights": insights,
        "stats": context,
    }
