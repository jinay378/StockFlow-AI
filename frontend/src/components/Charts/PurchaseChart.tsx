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
  getMonthlyPurchases,
  type MonthlyPurchases,
} from "../../services/dashboard.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface PurchaseChartProps {
  period: string;
}

const PurchaseChart = ({ period }: PurchaseChartProps) => {
  const [purchases, setPurchases] = useState<MonthlyPurchases[]>([]);

  const loadPurchases = async () => {
    try {
      const data = await getMonthlyPurchases(period);
      setPurchases(data);
    } catch (error) {
      console.error("Failed to load monthly purchases", error);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, [period]);

  const chartData = {
    labels: purchases.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Purchases",
        data: purchases.map((item) => item.total),
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.2)",
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
        <span>🛒</span> Monthly Purchases Trends
      </h2>

      <div className="h-[320px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PurchaseChart;