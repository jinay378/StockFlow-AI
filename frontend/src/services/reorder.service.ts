import api from "./api";

export interface ReorderSuggestion {
  product_id: number;
  product_name: string;
  sku: string | null;
  current_stock: number;
  minimum_stock: number;
  avg_daily_sales: number;
  days_of_stock_remaining: number | null;
  suggested_reorder_qty: number;
  urgency: "critical" | "high" | "medium" | "ok";
}

export const getReorderSuggestions = async (
  lookbackDays: number = 30,
  leadTimeDays: number = 14
): Promise<ReorderSuggestion[]> => {
  const response = await api.get("/reorder/suggestions", {
    params: {
      lookback_days: lookbackDays,
      lead_time_days: leadTimeDays,
    },
  });

  return response.data;
};
