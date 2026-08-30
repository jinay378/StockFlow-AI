import { useEffect, useState } from "react";
import {
  getRecentSales,
  type RecentSale,
} from "../../../services/dashboard.service";

interface RecentSalesProps {
  period: string;
}

const RecentSales = ({ period }: RecentSalesProps) => {
  const [sales, setSales] = useState<RecentSale[]>([]);

  const loadRecentSales = async () => {
    try {
      const data = await getRecentSales(period);
      setSales(data);
    } catch (error) {
      console.error("Failed to load recent sales", error);
    }
  };

  useEffect(() => {
    loadRecentSales();
  }, [period]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>🧾</span> Recent Sales
      </h2>

      {sales.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No recent sales recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="p-3 text-left rounded-l-lg">Sale ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right rounded-r-lg">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    #{sale.id.toString().padStart(5, "0")}
                  </td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {sale.customer}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{sale.total.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-right text-xs text-slate-500 dark:text-slate-400">
                    {sale.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentSales;