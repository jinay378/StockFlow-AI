import api from "./api";

export interface DashboardSummary {
  total_products: number;
  total_categories: number;
  total_suppliers: number;
  total_customers: number;
  inventory_items: number;
  low_stock_items: number;
}

export interface ReportItem {
  id: number;
  product: string;
  quantity: number;
  minimum_stock: number;
  warehouse: string;
}

// Dashboard Summary
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get("/reports/summary");
  return response.data;
};

// Low Stock Report
export const getLowStockReport = async (): Promise<ReportItem[]> => {
  const response = await api.get("/reports/low-stock");
  return response.data;
};

// Inventory Report
export const getInventoryReport = async (): Promise<ReportItem[]> => {
  const response = await api.get("/reports/inventory");
  return response.data;
};