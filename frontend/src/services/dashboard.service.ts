import api from "./api";

/* ===========================
   Dashboard Interfaces
=========================== */

export interface DashboardData {
  total_products: number;
  total_categories: number;
  total_suppliers: number;
  total_customers: number;
  total_sales: number;
  total_purchases: number;
  total_orders: number;
  low_stock_products: number;
  today_sales: number;
  today_purchases: number;
}

export interface MonthlySales {
  month: string;
  total: number;
}

export interface MonthlyPurchases {
  month: string;
  total: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface RecentSale {
  id: number;
  customer: string;
  total: number;
  date: string;
}

export interface LowStockProduct {
  product: string;
  quantity: number;
  minimum_stock: number;
}

export interface InventoryAnalytics {
  inventory_value: number;
  total_quantity: number;
  average_price: number;
}

export interface TopSellingProduct {
  product: string;
  units_sold: number;
  revenue: number;
}

export interface BestCustomer {
  customer: string;
  orders: number;
  total_purchase: number;
}

export interface SalesByCategory {
  category: string;
  revenue: number;
}

/* ===========================
   Dashboard APIs
=========================== */

export const getDashboard = async (
  period: string = "all"
): Promise<DashboardData> => {
  const response = await api.get("/dashboard", {
    params: { period },
  });

  return response.data;
};

export const getMonthlySales = async (
  period: string = "all"
): Promise<MonthlySales[]> => {
  const response = await api.get("/dashboard/monthly-sales", {
    params: { period },
  });

  return response.data;
};

export const getMonthlyPurchases = async (
  period: string = "all"
): Promise<MonthlyPurchases[]> => {
  const response = await api.get("/dashboard/monthly-purchases", {
    params: { period },
  });

  return response.data;
};

export const getCategoryDistribution = async (
  period: string = "all"
): Promise<CategoryDistribution[]> => {
  const response = await api.get("/dashboard/category-distribution", {
    params: { period },
  });

  return response.data;
};

export const getRecentSales = async (
  period: string = "all"
): Promise<RecentSale[]> => {
  const response = await api.get("/dashboard/recent-sales", {
    params: { period },
  });

  return response.data;
};

export const getLowStockProducts = async (): Promise<LowStockProduct[]> => {
  const response = await api.get("/dashboard/low-stock-products");
  return response.data;
};

export const getInventoryAnalytics = async (): Promise<InventoryAnalytics> => {
  const response = await api.get("/dashboard/inventory-analytics");
  return response.data;
};

export const getTopSellingProducts = async (
  period: string = "all"
): Promise<TopSellingProduct[]> => {
  const response = await api.get("/dashboard/top-selling-products", {
    params: { period },
  });

  return response.data;
};

export const getBestCustomers = async (
  period: string = "all"
): Promise<BestCustomer[]> => {
  const response = await api.get("/dashboard/best-customers", {
    params: { period },
  });

  return response.data;
};

export const getSalesByCategory = async (
  period: string = "all"
): Promise<SalesByCategory[]> => {
  const response = await api.get("/dashboard/sales-by-category", {
    params: { period },
  });

  return response.data;
};

export interface LowStockAlert {
  product_id: number;
  product: string;
  sku: string | null;
  quantity: number;
  minimum_stock: number;
  warehouse: string;
  severity: "critical" | "high" | "low";
}

export const getLowStockAlerts = async (): Promise<LowStockAlert[]> => {
  const response = await api.get("/dashboard/low-stock-alerts");
  return response.data;
};