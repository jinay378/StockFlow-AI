import { useEffect, useState } from "react";
import {
  getBestCustomers,
  type BestCustomer,
} from "../../../services/dashboard.service";

interface BestCustomersProps {
  period: string;
}

const BestCustomers = ({ period }: BestCustomersProps) => {
  const [customers, setCustomers] = useState<BestCustomer[]>([]);

  const loadCustomers = async () => {
    try {
      const data = await getBestCustomers(period);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load best customers", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [period]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>👑</span> Best Customers
      </h2>

      {customers.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No customer sales recorded for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="text-left p-3 rounded-l-lg">
                  Customer
                </th>
                <th className="text-center p-3">
                  Orders
                </th>
                <th className="text-right p-3 rounded-r-lg">
                  Total Purchase
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {customers.map((customer, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {customer.customer}
                  </td>

                  <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                    {customer.orders}
                  </td>

                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{customer.total_purchase.toLocaleString("en-IN")}
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

export default BestCustomers;