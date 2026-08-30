import api from "./api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category_id?: number;
}

// =========================================================
// GET ALL PRODUCTS
// =========================================================

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products/");
  return response.data;
};


// =========================================================
// GET SINGLE PRODUCT
// =========================================================

export const getProduct = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};


// =========================================================
// CREATE PRODUCT
// =========================================================

export const createProduct = async (product: any) => {
  const response = await api.post("/products/", product);
  return response.data;
};


// =========================================================
// UPDATE PRODUCT
// =========================================================

export const updateProduct = async (
  id: number,
  product: any
) => {
  const response = await api.put(
    `/products/${id}`,
    product
  );

  return response.data;
};


// =========================================================
// DELETE PRODUCT
// =========================================================

export const deleteProduct = async (id: number) => {
  const response = await api.delete(
    `/products/${id}`
  );

  return response.data;
};