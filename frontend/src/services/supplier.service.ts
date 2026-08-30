import api from "./api";

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get("/suppliers/");
  return response.data;
};

export const createSupplier = async (supplier: any) => {
  const response = await api.post("/suppliers/", supplier);
  return response.data;
};

export const updateSupplier = async (
  id: number,
  supplier: any
) => {
  const response = await api.put(`/suppliers/${id}`, supplier);
  return response.data;
};

export const deleteSupplier = async (id: number) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};