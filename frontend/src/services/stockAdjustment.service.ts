import api from "./api";

export interface StockAdjustment {
  id: number;
  product_id: number;
  quantity: number;
  adjustment_type: "INCREASE" | "DECREASE";
  reason: string;
  created_at: string;
}

export interface StockAdjustmentPayload {
  product_id: number;
  quantity: number;
  adjustment_type: "INCREASE" | "DECREASE";
  reason: string;
}

export const getStockAdjustments = async (): Promise<
  StockAdjustment[]
> => {
  const response = await api.get("/stock-adjustments/");
  return response.data;
};

export const getStockAdjustmentById = async (
  id: number
): Promise<StockAdjustment> => {
  const response = await api.get(`/stock-adjustments/${id}`);
  return response.data;
};

export const createStockAdjustment = async (
  data: StockAdjustmentPayload
) => {
  const response = await api.post("/stock-adjustments/", data);
  return response.data;
};

export const deleteStockAdjustment = async (id: number) => {
  const response = await api.delete(`/stock-adjustments/${id}`);
  return response.data;
};
