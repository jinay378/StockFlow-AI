import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  getSalesByCategory,
  type SalesByCategory,
} from "../../services/dashboard.service";

interface SalesByCategoryChartProps {
  period: string;
}

const SalesByCategoryChart = ({
  period,
}: SalesByCategoryChartProps) => {
  const [data, setData] = useState<SalesByCategory[]>([]);

  const loadData = async () => {
    try {
      const result = await getSalesByCategory(period);
      setData(result);
    } catch (error) {
      console.error("Failed to load sales by category", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>📊</span> Sales Revenue by Category
      </h2>

      {data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No sales recorded for this period.
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                }}
                formatter={(value: any) => [
                  `₹${Number(value || 0).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />

              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SalesByCategoryChart;