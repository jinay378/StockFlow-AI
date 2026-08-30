import { useEffect, useState } from "react";
import {
  getTopSellingProducts,
  type TopSellingProduct,
} from "../../../services/dashboard.service";

interface TopSellingProductsProps {
  period: string;
}

const TopSellingProducts = ({
  period,
}: TopSellingProductsProps) => {
  const [products, setProducts] = useState<TopSellingProduct[]>([]);

  const loadProducts = async () => {
    try {
      const data = await getTopSellingProducts(period);
      setProducts(data);
    } catch (error) {
      console.error("Failed to load top selling products", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [period]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span>🏆</span> Top Selling Products
      </h2>

      {products.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No sales recorded for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="text-left p-3 rounded-l-lg">
                  Product
                </th>
                <th className="text-center p-3">
                  Units Sold
                </th>
                <th className="text-right p-3 rounded-r-lg">
                  Revenue
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {products.map((product, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {product.product}
                  </td>

                  <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                    {product.units_sold}
                  </td>

                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{product.revenue.toLocaleString("en-IN")}
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

export default TopSellingProducts;