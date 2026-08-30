import api from "./api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CustomerPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const getCustomers = async () => {
  const response = await api.get("/customers/");
  return response.data;
};

export const getCustomerById = async (id: number) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customer: CustomerPayload) => {
  const response = await api.post("/customers/", customer);
  return response.data;
};

export const updateCustomer = async (
  id: number,
  customer: CustomerPayload
) => {
  const response = await api.put(`/customers/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};