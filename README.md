# 🚀 StockFlow AI — Intelligent Inventory Management & SaaS Platform

StockFlow AI is a modern, AI-powered Inventory Management & Supply Chain platform engineered for small and medium businesses, warehouses, and retailers. It combines multi-warehouse stock control, real-time transaction processing, predictive restocking algorithms, and an interactive AI Inventory Copilot.

---

## 📸 Core Features

- 📊 **Real-Time Executive Dashboard**: Live KPIs, sales/purchases velocity, category breakdown charts, and one-click PDF export.
- 📦 **Catalog & Multi-Warehouse Inventory**: Product SKU tracking, low stock thresholds, and stock adjustments.
- 🤖 **AI Reorder Forecast & Copilot**: Predictive moving-average algorithms estimating depletion rate, plus a natural language AI Copilot answering inventory queries in real time.
- 🛒 **POS & Sales Invoicing**: Multi-item sales orders with automatic stock deductions and downloadable PDF tax invoices.
- 🚚 **Procurement & Purchase Orders**: Supplier PO management with automatic stock replenishment.
- 👥 **Stakeholder Management**: Full CRUD for Categories, Suppliers, and Customers.
- 📄 **Analytics & Reports**: Comprehensive inventory valuation, low stock warnings, and CSV exports.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Chart.js, Lucide Icons, jsPDF & html2pdf.
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite / PostgreSQL, Pydantic, Passlib / Bcrypt, Python-JOSE (JWT).
- **AI Intelligence**: Custom heuristics + Context-Aware Copilot Engine.

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Seed the database with demo products, sales, and categories
python seed_data.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The API documentation will be available at: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 🔑 Demo Admin Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `admin123` |
