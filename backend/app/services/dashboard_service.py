from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.category_model import Category
from app.models.customer_model import Customer
from app.models.inventory_model import Inventory
from app.models.product_model import Product
from app.models.purchase_model import Purchase
from app.models.sale_model import Sale, SaleItem
from app.models.supplier_model import Supplier


def get_date_range(period: str):
    if not period or period == "all":
        return None, None

    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    if period == "today":
        return today_start, today_end

    if period == "7days":
        return today_start - timedelta(days=7), today_end

    if period == "30days":
        return today_start - timedelta(days=30), today_end

    if period == "year":
        return datetime(now.year, 1, 1, 0, 0, 0), today_end

    # Check for single date format 'YYYY-MM-DD'
    if len(period) == 10 and period.count("-") == 2:
        try:
            dt = datetime.strptime(period, "%Y-%m-%d")
            return (
                dt.replace(hour=0, minute=0, second=0, microsecond=0),
                dt.replace(hour=23, minute=59, second=59, microsecond=999999),
            )
        except ValueError:
            pass

    # Check for custom range 'custom:YYYY-MM-DD:YYYY-MM-DD'
    if period.startswith("custom:"):
        parts = period.split(":")
        if len(parts) == 3:
            try:
                dt_start = datetime.strptime(parts[1], "%Y-%m-%d").replace(
                    hour=0, minute=0, second=0, microsecond=0
                )
                dt_end = datetime.strptime(parts[2], "%Y-%m-%d").replace(
                    hour=23, minute=59, second=59, microsecond=999999
                )
                return dt_start, dt_end
            except ValueError:
                pass

    return None, None


def get_start_date(period: str):
    start, _ = get_date_range(period)
    return start


def get_dashboard(db: Session, period: str = "all", user_id: Optional[int] = None):
    start_date, end_date = get_date_range(period)
    today = date.today()

    prod_q = db.query(Product)
    cat_q = db.query(Category)
    supp_q = db.query(Supplier)
    cust_q = db.query(Customer)
    sales_query = db.query(func.coalesce(func.sum(Sale.total_amount), 0))
    purchase_query = db.query(func.coalesce(func.sum(Purchase.total_amount), 0))

    if user_id:
        prod_q = prod_q.filter(Product.user_id == user_id)
        cat_q = cat_q.filter(Category.user_id == user_id)
        supp_q = supp_q.filter(Supplier.user_id == user_id)
        cust_q = cust_q.filter(Customer.user_id == user_id)
        sales_query = sales_query.filter(Sale.user_id == user_id)
        purchase_query = purchase_query.filter(Purchase.user_id == user_id)

    total_products = prod_q.count()
    total_categories = cat_q.count()
    total_suppliers = supp_q.count()
    total_customers = cust_q.count()

    if start_date:
        sales_query = sales_query.filter(Sale.created_at >= start_date)
        purchase_query = purchase_query.filter(Purchase.created_at >= start_date)

    if end_date:
        sales_query = sales_query.filter(Sale.created_at <= end_date)
        purchase_query = purchase_query.filter(Purchase.created_at <= end_date)

    total_sales = sales_query.scalar() or 0
    total_purchases = purchase_query.scalar() or 0

    low_stock_q = (
        db.query(Product)
        .filter(Product.quantity < 10)
    )
    if user_id:
        low_stock_q = low_stock_q.filter(Product.user_id == user_id)
    low_stock_products = low_stock_q.count()

    target_day = (
        start_date.date()
        if (start_date and end_date and start_date.date() == end_date.date())
        else today
    )

    today_sales_q = (
        db.query(func.coalesce(func.sum(Sale.total_amount), 0))
        .filter(func.date(Sale.created_at) == target_day)
    )
    today_purchases_q = (
        db.query(func.coalesce(func.sum(Purchase.total_amount), 0))
        .filter(func.date(Purchase.created_at) == target_day)
    )

    if user_id:
        today_sales_q = today_sales_q.filter(Sale.user_id == user_id)
        today_purchases_q = today_purchases_q.filter(Purchase.user_id == user_id)

    today_sales = today_sales_q.scalar() or 0
    today_purchases = today_purchases_q.scalar() or 0

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_suppliers": total_suppliers,
        "total_customers": total_customers,
        "total_sales": float(total_sales),
        "total_purchases": float(total_purchases),
        "low_stock_products": low_stock_products,
        "today_sales": float(today_sales),
        "today_purchases": float(today_purchases),
    }


def get_monthly_sales(db: Session, period: str = "all", user_id: Optional[int] = None):
    months = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
        7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
    }

    monthly_sales = {month: 0.0 for month in range(1, 13)}

    query = db.query(
        extract("month", Sale.created_at).label("month"),
        func.sum(Sale.total_amount).label("total"),
    )

    if user_id:
        query = query.filter(Sale.user_id == user_id)

    start_date, end_date = get_date_range(period)
    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    results = (
        query.group_by(extract("month", Sale.created_at))
        .order_by(extract("month", Sale.created_at))
        .all()
    )

    for month, total in results:
        if month:
            monthly_sales[int(month)] = float(total or 0)

    return [
        {
            "month": months[month],
            "total": monthly_sales[month],
        }
        for month in range(1, 13)
    ]


def get_monthly_purchases(db: Session, period: str = "all", user_id: Optional[int] = None):
    months = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
        7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
    }

    monthly_purchases = {month: 0.0 for month in range(1, 13)}

    query = db.query(
        extract("month", Purchase.created_at).label("month"),
        func.sum(Purchase.total_amount).label("total"),
    )

    if user_id:
        query = query.filter(Purchase.user_id == user_id)

    start_date, end_date = get_date_range(period)
    if start_date:
        query = query.filter(Purchase.created_at >= start_date)
    if end_date:
        query = query.filter(Purchase.created_at <= end_date)

    results = (
        query.group_by(extract("month", Purchase.created_at))
        .order_by(extract("month", Purchase.created_at))
        .all()
    )

    for month, total in results:
        if month:
            monthly_purchases[int(month)] = float(total or 0)

    return [
        {
            "month": months[month],
            "total": monthly_purchases[month],
        }
        for month in range(1, 13)
    ]


def get_category_distribution(db: Session, period: str = "all", user_id: Optional[int] = None):
    query = (
        db.query(
            Category.name.label("category"),
            func.count(Product.id).label("count"),
        )
        .select_from(Category)
        .outerjoin(
            Product,
            Product.category_id == Category.id,
        )
    )

    if user_id:
        query = query.filter(Category.user_id == user_id)

    results = (
        query.group_by(Category.id, Category.name)
        .all()
    )

    return [
        {
            "category": row.category,
            "count": int(row.count),
        }
        for row in results
    ]


def get_recent_sales(db: Session, period: str = "all", user_id: Optional[int] = None):
    start_date, end_date = get_date_range(period)

    query = (
        db.query(
            Sale.id,
            Customer.name.label("customer"),
            Sale.total_amount,
            Sale.created_at,
        )
        .join(Customer, Sale.customer_id == Customer.id)
    )

    if user_id:
        query = query.filter(Sale.user_id == user_id)

    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    results = (
        query.order_by(Sale.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": sale.id,
            "customer": sale.customer,
            "total": float(sale.total_amount),
            "date": sale.created_at.strftime("%Y-%m-%d") if sale.created_at else "",
        }
        for sale in results
    ]


def get_inventory_analytics(db: Session, user_id: Optional[int] = None):
    prod_q = db.query(Product)
    if user_id:
        prod_q = prod_q.filter(Product.user_id == user_id)

    products = prod_q.all()
    inventory_value = sum((p.price or 0) * (p.quantity or 0) for p in products)
    total_quantity = sum(p.quantity or 0 for p in products)
    average_price = (sum(p.price or 0 for p in products) / len(products)) if products else 0.0

    return {
        "inventory_value": float(inventory_value),
        "total_quantity": int(total_quantity),
        "average_price": round(float(average_price), 2),
    }


def get_top_selling_products(db: Session, period: str = "all", user_id: Optional[int] = None):
    start_date, end_date = get_date_range(period)

    query = (
        db.query(
            Product.name.label("product"),
            func.sum(SaleItem.quantity).label("units_sold"),
            func.sum(SaleItem.subtotal).label("revenue"),
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .join(Sale, Sale.id == SaleItem.sale_id)
    )

    if user_id:
        query = query.filter(Sale.user_id == user_id)

    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    results = (
        query.group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "product": row.product,
            "units_sold": int(row.units_sold or 0),
            "revenue": float(row.revenue or 0),
        }
        for row in results
    ]


def get_low_stock_products(db: Session, user_id: Optional[int] = None):
    query = (
        db.query(
            Product.name,
            Product.quantity,
        )
        .filter(Product.quantity < 10)
    )
    if user_id:
        query = query.filter(Product.user_id == user_id)

    results = query.order_by(Product.quantity.asc()).limit(5).all()

    return [
        {
            "product": name,
            "quantity": quantity or 0,
            "minimum_stock": 10,
        }
        for name, quantity in results
    ]


def get_best_customers(db: Session, period: str = "all", user_id: Optional[int] = None):
    start_date, end_date = get_date_range(period)

    query = (
        db.query(
            Customer.name.label("customer"),
            func.count(Sale.id).label("orders"),
            func.coalesce(func.sum(Sale.total_amount), 0).label("total_purchase"),
        )
        .join(Sale, Customer.id == Sale.customer_id)
    )

    if user_id:
        query = query.filter(Customer.user_id == user_id, Sale.user_id == user_id)

    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    results = (
        query.group_by(Customer.id, Customer.name)
        .order_by(func.sum(Sale.total_amount).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "customer": row.customer,
            "orders": int(row.orders or 0),
            "total_purchase": float(row.total_purchase or 0),
        }
        for row in results
    ]


def get_sales_by_category(db: Session, period: str = "all", user_id: Optional[int] = None):
    start_date, end_date = get_date_range(period)

    query = (
        db.query(
            Category.name.label("category"),
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("revenue"),
        )
        .join(Product, Product.category_id == Category.id)
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
    )

    if user_id:
        query = query.filter(Category.user_id == user_id, Sale.user_id == user_id)

    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    results = (
        query.group_by(Category.id, Category.name)
        .order_by(func.sum(SaleItem.subtotal).desc())
        .all()
    )

    return [
        {
            "category": row.category,
            "revenue": float(row.revenue or 0),
        }
        for row in results
    ]


def get_low_stock_alerts(db: Session, user_id: Optional[int] = None):
    query = (
        db.query(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity,
        )
        .filter(Product.quantity < 10)
    )
    if user_id:
        query = query.filter(Product.user_id == user_id)

    results = query.order_by(Product.quantity.asc()).all()
    alerts = []

    for product_id, name, sku, quantity in results:
        qty = quantity or 0
        if qty <= 0:
            severity = "critical"
        elif qty <= 5:
            severity = "high"
        else:
            severity = "low"

        alerts.append({
            "product_id": product_id,
            "product": name,
            "sku": sku or f"SKU-{product_id}",
            "quantity": qty,
            "minimum_stock": 10,
            "warehouse": "Main Warehouse",
            "severity": severity,
        })

    return alerts
