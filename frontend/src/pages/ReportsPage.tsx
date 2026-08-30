import { useEffect, useMemo, useState } from "react";

import {
  getDashboardSummary,
  getInventoryReport,
  getLowStockReport,
  type DashboardSummary,
  type ReportItem,
} from "../services/report.service";

const ReportsPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [inventory, setInventory] = useState<ReportItem[]>([]);

  const [lowStock, setLowStock] = useState<ReportItem[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const [summaryData, inventoryData, lowStockData] =
        await Promise.all([
          getDashboardSummary(),
          getInventoryReport(),
          getLowStockReport(),
        ]);

      setSummary(summaryData);

      setInventory(inventoryData);

      setLowStock(lowStockData);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.product.toLowerCase().includes(keyword) ||
        item.warehouse.toLowerCase().includes(keyword)
      );
    });
  }, [inventory, search]);

  const filteredLowStock = useMemo(() => {
    return lowStock.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.product.toLowerCase().includes(keyword) ||
        item.warehouse.toLowerCase().includes(keyword)
      );
    });
  }, [lowStock, search]);

  const exportCSV = () => {
    const headers = [
      "Product",
      "Quantity",
      "Minimum Stock",
      "Warehouse",
    ];

    const rows = filteredInventory.map((item) => [
      item.product,
      item.quantity,
      item.minimum_stock,
      item.warehouse,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "inventory_report.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-sm text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mr-3" />
        Generating reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 text-sm font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregate data exports, warehouse stock analysis, and executive summaries
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          📥 Export Inventory CSV
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Products</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.total_products}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Categories</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.total_categories}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Suppliers</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.total_suppliers}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Customers</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.total_customers}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Stock Rows</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary?.inventory_items}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Low Stock</p>
          <h2 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            {summary?.low_stock_items}
          </h2>
        </div>
      </div>

      {/* Main Inventory Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Comprehensive Inventory Status
          </h2>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report items..."
            className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-center">Minimum Threshold</th>
                <th className="p-4 text-left">Warehouse</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    {item.product}
                  </td>

                  <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                    {item.quantity}
                  </td>

                  <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                    {item.minimum_stock}
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {item.warehouse}
                  </td>

                  <td className="p-4 text-center">
                    {item.quantity <= item.minimum_stock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Low Stock Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-red-500">⚠</span> Low Stock Attention List
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800/50">
            {filteredLowStock.length} items flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-center">Current Quantity</th>
                <th className="p-4 text-center">Minimum Threshold</th>
                <th className="p-4 text-left">Warehouse</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLowStock.length > 0 ? (
                filteredLowStock.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-red-50/40 dark:hover:bg-red-950/20 transition"
                  >
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {item.product}
                    </td>

                    <td className="p-4 text-center font-bold text-red-600 dark:text-red-400">
                      {item.quantity}
                    </td>

                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                      {item.minimum_stock}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {item.warehouse}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No low stock items currently detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;