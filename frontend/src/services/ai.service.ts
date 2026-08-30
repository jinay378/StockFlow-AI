import api from "./api";

export interface AIChatResponse {
  reply: string;
  context?: {
    low_stock_count: number;
    total_products: number;
    total_sales: number;
  };
  suggestions: string[];
}

export interface AIInsight {
  type: "warning" | "opportunity" | "success" | "info";
  title: string;
  description: string;
  action?: string;
  route?: string;
}

export const sendAIChatMessage = async (
  message: string
): Promise<AIChatResponse> => {
  const response = await api.post("/ai/chat", { message });
  return response.data;
};

export const getAIInsights = async (): Promise<AIInsight[]> => {
  const response = await api.get("/ai/insights");
  return response.data;
};
