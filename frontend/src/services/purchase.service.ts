import api from "./api";

export interface PurchaseItemCreate {
  product_id: number;
  quantity: number;
  price: number;
}

export interface PurchaseCreate {
  supplier_id: number;
  items: PurchaseItemCreate[];
}

export interface PurchaseItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface PurchaseResponse {
  id: number;
  supplier_id: number;
  total_amount: number;
  created_at: string;
  items: PurchaseItemResponse[];
}

export const getPurchases = async (): Promise<PurchaseResponse[]> => {
  const response = await api.get("/purchases/");
  return response.data;
};

export const getPurchaseById = async (
  id: number
): Promise<PurchaseResponse> => {
  const response = await api.get(`/purchases/${id}`);
  return response.data;
};

export const createPurchase = async (
  purchase: PurchaseCreate
): Promise<PurchaseResponse> => {
  const response = await api.post("/purchases/", purchase);
  return response.data;
};

export const deletePurchase = async (id: number) => {
  const response = await api.delete(`/purchases/${id}`);
  return response.data;
};