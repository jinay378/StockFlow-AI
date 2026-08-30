import api from "./api";

export interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  minimum_stock: number;
  warehouse: string;
}

export interface InventoryPayload {
  product_id: number;
  quantity: number;
  minimum_stock: number;
  warehouse: string;
}

export const getInventory = async (): Promise<Inventory[]> => {
  const response = await api.get("/inventory/");
  return response.data;
};

export const getInventoryById = async (
  id: number
): Promise<Inventory> => {
  const response = await api.get(`/inventory/${id}`);
  return response.data;
};

export const createInventory = async (
  data: InventoryPayload
) => {
  const response = await api.post("/inventory/", data);
  return response.data;
};

export const updateInventory = async (
  id: number,
  data: InventoryPayload
) => {
  const response = await api.put(`/inventory/${id}`, data);
  return response.data;
};

export const deleteInventory = async (
  id: number
) => {
  const response = await api.delete(`/inventory/${id}`);
  return response.data;
};