import api from "./api";

export const getCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

export const createCategory = async (category: any) => {
  const response = await api.post("/categories/", category);
  return response.data;
};

export const updateCategory = async (
  id: number,
  category: any
) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};