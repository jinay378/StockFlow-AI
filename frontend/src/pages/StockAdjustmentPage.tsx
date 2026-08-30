import { useEffect, useMemo, useState } from "react";
import StockAdjustmentForm from "../components/forms/StockAdjustmentForm";

import {
  getStockAdjustments,
  deleteStockAdjustment,
} from "../services/stockAdjustment.service";

import type { StockAdjustment } from "../services/stockAdjustment.service";

const StockAdjustmentPage = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadAdjustments = async () => {
    try {
      const data = await getStockAdjustments();
      setAdjustments(data);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch stock adjustments.");
    }
  };

  useEffect(() => {
    loadAdjustments();
  }, []);

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this stock adjustment?")) {
      return;
    }

    try {
      await deleteStockAdjustment(id);
      loadAdjustments();
    } catch (error) {
      console.error(error);
      alert("Unable to delete stock adjustment.");
    }
  };

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((item) =>
      item.reason.toLowerCase().includes(search.toLowerCase())
    );
  }, [adjustments, search]);

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Stock Adjustments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manual stock reconcilements, write-offs, damages, and audit corrections
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          + Adjust Stock
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            {filteredAdjustments.length} adjustment records
          </span>

          <input
            type="text"
            placeholder="Search reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Product ID</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAdjustments.length > 0 ? (
                filteredAdjustments.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      #{item.id}
                    </td>

                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      Product #{item.product_id}
                    </td>

                    <td className="p-4 text-center">
                      {item.adjustment_type === "INCREASE" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          + Increase
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                          - Decrease
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {item.reason || "—"}
                    </td>

                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-400 dark:text-slate-500"
                  >
                    No stock adjustments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <StockAdjustmentForm
          onClose={() => setShowModal(false)}
          onSuccess={loadAdjustments}
        />
      )}
    </div>
  );
};

export default StockAdjustmentPage;
