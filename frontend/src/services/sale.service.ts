import api from "./api";

export interface SaleItemCreate {
  product_id: number;
  quantity: number;
}

export interface SaleCreate {
  customer_id: number;
  items: SaleItemCreate[];
}

export interface SaleItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface SaleResponse {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at: string;
  items: SaleItemResponse[];
}

/**
 * Get all sales
 */
export async function getSales(): Promise<SaleResponse[]> {
  const response = await api.get("/sales/");
  return response.data;
}

/**
 * Get sale by ID
 */
export async function getSaleById(id: number): Promise<SaleResponse> {
  const response = await api.get(`/sales/${id}`);
  return response.data;
}

/**
 * Create a new sale
 */
export async function createSale(
  sale: SaleCreate
): Promise<SaleResponse> {
  const response = await api.post("/sales/", sale);
  return response.data;
}

/**
 * Delete a sale
 */
export async function deleteSale(id: number): Promise<void> {
  await api.delete(`/sales/${id}`);
}