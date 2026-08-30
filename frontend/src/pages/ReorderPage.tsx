import { useEffect, useState } from "react";
import { getReorderSuggestions } from "../services/reorder.service";
import type { ReorderSuggestion } from "../services/reorder.service";

const urgencyStyles: Record<
  string,
  { label: string; badge: string; row: string }
> = {
  critical: {
    label: "Reorder Now",
    badge: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50",
    row: "hover:bg-red-50/50 dark:hover:bg-red-950/20",
  },
  high: {
    label: "Reorder Soon",
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
    row: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
  },
  medium: {
    label: "Watch",
    badge: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
    row: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
  },
  ok: {
    label: "Healthy",
    badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
    row: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
  },
};

const ReorderPage = () => {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookbackDays, setLookbackDays] = useState(30);
  const [leadTimeDays, setLeadTimeDays] = useState(14);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getReorderSuggestions(lookbackDays, leadTimeDays);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actionableCount = suggestions.filter(
    (s) => s.urgency === "critical" || s.urgency === "high"
  ).length;

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Reorder Suggestions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Predictive restocking models based on historical sales velocity and supplier lead times
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-end gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Sales history window (days)
          </label>
          <input
            type="number"
            min={7}
            value={lookbackDays}
            onChange={(e) => setLookbackDays(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white w-44 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Supplier lead time (days)
          </label>
          <input
            type="number"
            min={1}
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white w-44 focus:border-emerald-500"
          />
        </div>

        <button
          onClick={loadSuggestions}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition"
        >
          ⚡ Recalculate Velocity
        </button>

        {actionableCount > 0 && (
          <span className="ml-auto text-xs font-semibold px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full">
            ⚠ {actionableCount} product{actionableCount > 1 ? "s" : ""} require restock
          </span>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mb-2" />
            <p className="text-sm">Calculating velocity-based reorder projections...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            No inventory suggestions available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-4 text-left">Product Name</th>
                  <th className="p-4 text-center">Current Stock</th>
                  <th className="p-4 text-center">Avg Daily Velocity</th>
                  <th className="p-4 text-center">Runway Remaining</th>
                  <th className="p-4 text-center">Recommended Reorder</th>
                  <th className="p-4 text-center">Urgency</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {suggestions.map((s) => {
                  const style = urgencyStyles[s.urgency] || urgencyStyles.ok;

                  return (
                    <tr key={s.product_id} className={`${style.row} transition`}>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        {s.product_name}
                        {s.sku && (
                          <span className="text-slate-400 dark:text-slate-500 text-xs block font-mono">
                            SKU: {s.sku}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                        {s.current_stock}
                      </td>

                      <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                        {s.avg_daily_sales} units/day
                      </td>

                      <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                        {s.days_of_stock_remaining === null
                          ? "No recent sales"
                          : `${s.days_of_stock_remaining} days`}
                      </td>

                      <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {s.suggested_reorder_qty > 0
                          ? `+${s.suggested_reorder_qty} units`
                          : "—"}
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

export default ReorderPage;
