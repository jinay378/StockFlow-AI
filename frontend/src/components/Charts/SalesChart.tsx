import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import {
  getMonthlySales,
  type MonthlySales,
} from "../../services/dashboard.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface SalesChartProps {
  period: string;
}

const SalesChart = ({ period }: SalesChartProps) => {
  const [sales, setSales] = useState<MonthlySales[]>([]);

  const loadSales = async () => {
    try {
      const data = await getMonthlySales(period);
      setSales(data);
    } catch (error) {
      console.error("Failed to load monthly sales", error);
    }
  };

  useEffect(() => {
    loadSales();
  }, [period]);

  const chartData = {
    labels: sales.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Sales",
        data: sales.map((item) => item.total),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>📈</span> Monthly Sales Trends
      </h2>

      <div className="h-[320px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SalesChart;