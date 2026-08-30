import { useEffect, useState } from "react";
import {
  getInventoryAnalytics,
  type InventoryAnalytics as InventoryAnalyticsData,
} from "../../../services/dashboard.service";

const InventoryAnalytics = () => {
  const [analytics, setAnalytics] = useState<InventoryAnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getInventoryAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load inventory analytics", error);
    }
  };

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>📊</span> Inventory Analytics & Valuation
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 hover:border-emerald-500/30 transition">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Inventory Value
          </p>

          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{analytics.inventory_value.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 hover:border-blue-500/30 transition">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Stocked Units
          </p>

          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {analytics.total_quantity.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 hover:border-purple-500/30 transition">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Average Product Price
          </p>

          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
            ₹{analytics.average_price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;