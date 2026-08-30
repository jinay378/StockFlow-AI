import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

import {
  getCategoryDistribution,
  type CategoryDistribution,
} from "../../services/dashboard.service";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface CategoryPieChartProps {
  period: string;
}

const CategoryPieChart = ({ period }: CategoryPieChartProps) => {
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);

  const loadCategories = async () => {
    try {
      const data = await getCategoryDistribution(period);
      setCategories(data);
    } catch (error) {
      console.error("Failed to load category distribution", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [period]);

  const chartData = {
    labels: categories.map((item) => item.category),
    datasets: [
      {
        label: "Products",
        data: categories.map((item) => item.count),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#06B6D4",
          "#F97316",
          "#84CC16",
          "#EC4899",
          "#6B7280",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>📊</span> Product Category Distribution
      </h2>

      {categories.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No category data available.
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-[380px] h-[320px]">
            <Pie data={chartData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;