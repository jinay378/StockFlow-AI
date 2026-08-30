import { useEffect, useState } from "react";
import {
  createInventory,
  updateInventory,
} from "../../services/inventory.service";

import type { Inventory } from "../../services/inventory.service";
import { getProducts } from "../../services/product.service";

interface Product {
  id: number;
  name: string;
}

interface Props {
  inventory?: Inventory | null;
  onClose: () => void;
  onSuccess: () => void;
}

const InventoryForm = ({
  inventory,
  onClose,
  onSuccess,
}: Props) => {
  const [products, setProducts] = useState<Product[]>([]);

  const [productId, setProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(0);
  const [warehouse, setWarehouse] = useState("");

  useEffect(() => {
    loadProducts();

    if (inventory) {
      setProductId(inventory.product_id);
      setQuantity(inventory.quantity);
      setMinimumStock(inventory.minimum_stock);
      setWarehouse(inventory.warehouse);
    }
  }, [inventory]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const payload = {
      product_id: productId,
      quantity: quantity,
      minimum_stock: minimumStock,
      warehouse: warehouse,
    };

    try {
      if (inventory) {
        await updateInventory(inventory.id, payload);
      } else {
        await createInventory(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save inventory.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {inventory ? "Edit Inventory Record" : "Add Inventory Record"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} className="dark:bg-slate-900">
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Current Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Min Safety Stock
              </label>
              <input
                type="number"
                min="0"
                placeholder="10"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Warehouse Location
            </label>
            <input
              type="text"
              placeholder="e.g. North Hub - Warehouse A"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition"
            >
              {inventory ? "Update Inventory" : "Save Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;