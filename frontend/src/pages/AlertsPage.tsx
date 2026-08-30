import { useEffect, useState } from "react";
import {
  getLowStockAlerts,
} from "../services/dashboard.service";
import type { LowStockAlert } from "../services/dashboard.service";

const severityStyles: Record<
  string,
  { label: string; badge: string; row: string }
> = {
  critical: {
    label: "Out of Stock",
    badge: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50",
    row: "hover:bg-red-50/50 dark:hover:bg-red-950/20",
  },
  high: {
    label: "Critically Low",
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
    row: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
  },
  low: {
    label: "Low Stock",
    badge: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
    row: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
  },
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getLowStockAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const criticalCount = alerts.filter(
    (a) => a.severity === "critical"
  ).length;

  const highCount = alerts.filter((a) => a.severity === "high").length;

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Low Stock Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time threshold warnings for inventory items requiring restock action
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          ↻ Refresh Alerts
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Active Alerts
          </p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {alerts.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Completely Out of Stock
          </p>
          <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">
            {criticalCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Critically Low Items
          </p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {highCount}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mb-2" />
            <p className="text-sm">Scanning warehouse stock thresholds...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ All products are well stocked!
            </p>
            <p className="text-xs mt-1">Every inventory item is currently above its safety stock threshold.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-4 text-left">Product Name</th>
                  <th className="p-4 text-left">SKU</th>
                  <th className="p-4 text-left">Warehouse Location</th>
                  <th className="p-4 text-center">Available Stock</th>
                  <th className="p-4 text-center">Min Safety Stock</th>
                  <th className="p-4 text-center">Severity Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {alerts.map((alert) => {
                  const style = severityStyles[alert.severity] || severityStyles.low;

                  return (
                    <tr key={alert.product_id} className={`${style.row} transition`}>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        {alert.product}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {alert.sku ?? "—"}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {alert.warehouse}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                        {alert.quantity}
                      </td>
                      <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                        {alert.minimum_stock}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
