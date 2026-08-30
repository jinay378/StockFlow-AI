import { useEffect, useMemo, useState } from "react";
import InventoryForm from "../components/forms/InventoryForm";

import {
  getInventory,
  deleteInventory,
} from "../services/inventory.service";
import { getProducts, type Product } from "../services/product.service";

import type { Inventory } from "../services/inventory.service";

const InventoryPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<Inventory | null>(null);

  const loadData = async () => {
    try {
      const [invData, prodData] = await Promise.all([
        getInventory(),
        getProducts(),
      ]);
      setInventory(invData);
      setProducts(prodData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const handleAdd = () => {
    setSelectedInventory(null);
    setShowModal(true);
  };

  const handleEdit = (item: Inventory) => {
    setSelectedInventory(item);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this inventory item?")) {
      return;
    }

    try {
      await deleteInventory(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Unable to delete inventory.");
    }
  };

  const filteredInventory = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return inventory;
    return inventory.filter((item) => {
      const pName = productMap.get(item.product_id)?.name.toLowerCase() || "";
      const pSku = productMap.get(item.product_id)?.sku?.toLowerCase() || "";
      return (
        item.warehouse.toLowerCase().includes(q) ||
        pName.includes(q) ||
        pSku.includes(q)
      );
    });
  }, [inventory, search, productMap]);

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Warehouse Stock Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-location warehouse inventory counts, reorder thresholds, and stock statuses
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          + Add Inventory Item
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            {filteredInventory.length} inventory records
          </span>

          <input
            type="text"
            placeholder="Search warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Product Name & SKU</th>
                <th className="p-4 text-center">Available Stock</th>
                <th className="p-4 text-center">Min Threshold</th>
                <th className="p-4 text-left">Warehouse Location</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => {
                  const prod = productMap.get(item.product_id);
                  return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      #{index + 1}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {prod ? prod.name : `Product #${item.product_id}`}
                      </div>
                      {prod?.sku && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {prod.sku}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </td>

                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                      {item.minimum_stock}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.warehouse}
                    </td>

                    <td className="p-4 text-center">
                      {item.quantity <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                          Out of Stock
                        </span>
                      ) : item.quantity <= item.minimum_stock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-400 dark:text-slate-500"
                  >
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <InventoryForm
          inventory={selectedInventory}
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default InventoryPage;