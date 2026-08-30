"""
Database Seed Script for StockFlow AI
Populates the SQLite database with rich realistic demo data for immediate showcase.
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Ensure app package is reachable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.database.connection import engine, SessionLocal
from app.database.base import Base
from app.core.security import hash_password

from app.models.user_model import User, UserRole
from app.models.category_model import Category
from app.models.supplier_model import Supplier
from app.models.customer_model import Customer
from app.models.product_model import Product
from app.models.inventory_model import Inventory
from app.models.sale_model import Sale, SaleItem
from app.models.purchase_model import Purchase, PurchaseItem
from app.models.stock_adjustment_model import StockAdjustment
from app.models.stock_transaction_model import StockTransaction

def seed():
    print("🌱 Initializing StockFlow AI database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clear existing demo records to ensure clean state
        print("🧹 Cleaning old records...")
        db.query(StockTransaction).delete()
        db.query(StockAdjustment).delete()
        db.query(PurchaseItem).delete()
        db.query(Purchase).delete()
        db.query(SaleItem).delete()
        db.query(Sale).delete()
        db.query(Inventory).delete()
        db.query(Product).delete()
        db.query(Customer).delete()
        db.query(Supplier).delete()
        db.query(Category).delete()
        db.query(User).delete()
        db.commit()

        # 2. Users
        print("👤 Creating Admin user...")
        admin = User(
            username="admin",
            email="admin@example.com",
            password=hash_password("admin123"),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()

        # 3. Categories
        print("🏷️ Creating Categories...")
        categories_data = [
            ("Electronics & Gadgets", "Smartphones, laptops, smart accessories, and hardware"),
            ("Apparel & Footwear", "Men's and women's clothing, footwear, and sportswear"),
            ("Office Supplies", "Stationery, ergonomic desk accessories, and paper products"),
            ("Industrial Tools", "Power tools, safety gear, fasteners, and workshop equipment"),
            ("Food & Beverages", "Packaged goods, beverages, and specialty foodstuffs"),
            ("Home & Kitchen", "Appliances, cookware, and modern home essentials"),
        ]
        categories = []
        for name, desc in categories_data:
            cat = Category(name=name, description=desc)
            db.add(cat)
            categories.append(cat)
        db.commit()

        # 4. Suppliers
        print("🚚 Creating Suppliers...")
        suppliers_data = [
            ("Apex Electronics Ltd", "sales@apexelectronics.com", "+91 98765 43210", "Plot 42, Andheri East, Mumbai"),
            ("Nexus Global Supplies", "contact@nexusglobal.com", "+91 91234 56780", "Tech Park Sector 5, Bangalore"),
            ("Prime Retail Logistics", "procure@primeretail.com", "+91 98111 22334", "Industrial Area Phase 2, New Delhi"),
            ("Horizon Industrial Dist", "orders@horizonindustrial.com", "+91 99887 76655", "MIDC Bhosari, Pune"),
            ("Zenith Wholesale Co", "support@zenithwholesale.com", "+91 94567 89012", "GIDC Naroda, Ahmedabad"),
        ]
        suppliers = []
        for name, email, phone, addr in suppliers_data:
            sup = Supplier(name=name, email=email, phone=phone, address=addr)
            db.add(sup)
            suppliers.append(sup)
        db.commit()

        # 5. Customers
        print("👥 Creating Customers...")
        customers_data = [
            ("Acme Supermarket Chain", "procurement@acmeretail.com", "+91 98223 34455", "MG Road, Mumbai"),
            ("TechMatrix Solutions Ltd", "it@techmatrix.com", "+91 97112 23344", "Whitefield, Bangalore"),
            ("GreenLine Hypermarkets", "orders@greenline.com", "+91 96001 12233", "Anna Nagar, Chennai"),
            ("Swift Logistics Hub", "ops@swiftlogistics.com", "+91 95443 32211", "HITEC City, Hyderabad"),
            ("Metro Wholesale Hub", "manager@metrostores.com", "+91 94332 21100", "Salt Lake Sector V, Kolkata"),
            ("Alpha Digital Mart", "purchases@alphadigital.com", "+91 93221 10099", "Bandra Kurla Complex, Mumbai"),
        ]
        customers = []
        for name, email, phone, addr in customers_data:
            cust = Customer(name=name, email=email, phone=phone, address=addr)
            db.add(cust)
            customers.append(cust)
        db.commit()

        # 6. Products
        print("📦 Creating Products...")
        products_data = [
            # (name, sku, price, quantity, category_index)
            ("Pro ANC Wireless Headphones", "ELEC-HDPH-01", 3499.0, 48, 0),
            ("UltraSlim USB-C Hub 7-in-1", "ELEC-HUB-02", 1899.0, 65, 0),
            ("Mechanical RGB Gaming Keyboard", "ELEC-MKB-03", 2999.0, 32, 0),
            ("4K Ultra-HD Webcam with Mic", "ELEC-CAM-04", 2499.0, 8, 0),  # Low stock
            ("Cotton Oxford Button-Down Shirt", "APP-SHRT-01", 1299.0, 85, 1),
            ("Lightweight Athletic Running Shoes", "APP-SHOE-02", 2799.0, 4, 1), # Low stock
            ("Ergonomic Memory Foam Cushion", "OFF-CSHN-01", 999.0, 52, 2),
            ("Adjustable Aluminum Laptop Stand", "OFF-STND-02", 1499.0, 70, 2),
            ("Gel Ink Rollerball Pen Set (Pack of 12)", "OFF-PENS-03", 299.0, 140, 2),
            ("18V Cordless Impact Drill Kit", "IND-DRL-01", 4599.0, 18, 3),
            ("Heavy-Duty Digital Vernier Caliper", "IND-CLP-02", 899.0, 3, 3),  # Critically low stock
            ("Premium Arabica Coffee Beans (1kg)", "FNB-COF-01", 850.0, 95, 4),
            ("Organic Green Tea Selection Box", "FNB-TEA-02", 450.0, 110, 4),
            ("Stainless Steel Thermal Water Bottle 1L", "HM-BOT-01", 699.0, 80, 5),
            ("Non-Stick Cast Aluminum Frying Pan", "HM-PAN-02", 1599.0, 25, 5),
        ]
        products = []
        for name, sku, price, qty, cat_idx in products_data:
            prod = Product(
                name=name,
                sku=sku,
                price=price,
                quantity=qty,
                category_id=categories[cat_idx].id,
            )
            db.add(prod)
            products.append(prod)
        db.commit()

        # 7. Inventory allocations across warehouses
        print("🏭 Setting up Multi-Warehouse Inventory...")
        warehouses = ["Main Central Warehouse", "North Distribution Hub", "Express Retail Depot"]
        for prod in products:
            inv = Inventory(
                product_id=prod.id,
                quantity=prod.quantity,
                minimum_stock=10 if prod.quantity > 10 else 15,
                warehouse=random.choice(warehouses),
            )
            db.add(inv)
        db.commit()

        # 8. Sales History (spread over past 90 days)
        print("💰 Generating Historical Sales & Line Items...")
        now = datetime.now()
        for i in range(25):
            days_ago = random.randint(0, 75)
            sale_date = now - timedelta(days=days_ago, hours=random.randint(1, 12))
            cust = random.choice(customers)

            # 1 to 3 items per sale
            selected_prods = random.sample(products, k=random.randint(1, 3))
            total_amt = 0.0
            sale_items = []

            for p in selected_prods:
                item_qty = random.randint(1, 4)
                item_subtotal = p.price * item_qty
                total_amt += item_subtotal
                sale_items.append(
                    SaleItem(
                        product_id=p.id,
                        quantity=item_qty,
                        price=p.price,
                        subtotal=item_subtotal,
                    )
                )

            sale = Sale(
                customer_id=cust.id,
                total_amount=total_amt,
                created_at=sale_date,
                items=sale_items,
            )
            db.add(sale)
        db.commit()

        # 9. Purchases History
        print("🛒 Generating Vendor Purchases...")
        for i in range(10):
            days_ago = random.randint(5, 80)
            purch_date = now - timedelta(days=days_ago, hours=random.randint(1, 8))
            supp = random.choice(suppliers)
            selected_prods = random.sample(products, k=random.randint(1, 3))

            total_cost = 0.0
            purch_items = []
            for p in selected_prods:
                purch_qty = random.randint(10, 40)
                cost_price = round(p.price * 0.65, 2)  # 35% margin
                total_cost += purch_qty * cost_price
                purch_items.append(
                    PurchaseItem(
                        product_id=p.id,
                        quantity=purch_qty,
                        price=cost_price,
                    )
                )

            purch = Purchase(
                supplier_id=supp.id,
                total_amount=total_cost,
                created_at=purch_date,
                items=purch_items,
            )
            db.add(purch)
        db.commit()

        # 10. Stock Adjustments History
        print("⚖️ Generating Stock Adjustments...")
        reasons = ["Initial recount audit", "Damaged in transit", "Display sample write-off", "Returned by customer (restocked)"]
        for p in products[:4]:
            adj = StockAdjustment(
                product_id=p.id,
                quantity=random.randint(1, 3),
                adjustment_type=random.choice(["INCREASE", "DECREASE"]),
                reason=random.choice(reasons),
                created_at=now - timedelta(days=random.randint(1, 20)),
            )
            db.add(adj)
        db.commit()

        print("✅ Database seeding completed successfully!")
        print(f"   • Users: {db.query(User).count()}")
        print(f"   • Categories: {db.query(Category).count()}")
        print(f"   • Suppliers: {db.query(Supplier).count()}")
        print(f"   • Customers: {db.query(Customer).count()}")
        print(f"   • Products: {db.query(Product).count()}")
        print(f"   • Sales Orders: {db.query(Sale).count()}")
        print(f"   • Purchases: {db.query(Purchase).count()}")
        print(f"   • Inventory Records: {db.query(Inventory).count()}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
