import { useEffect, useState } from "react";
import { createStockAdjustment } from "../../services/stockAdjustment.service";
import { getProducts } from "../../services/product.service";

interface Product {
  id: number;
  name: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const StockAdjustmentForm = ({ onClose, onSuccess }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);

  const [productId, setProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<
    "INCREASE" | "DECREASE"
  >("INCREASE");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      product_id: productId,
      quantity: quantity,
      adjustment_type: adjustmentType,
      reason: reason,
    };

    try {
      await createStockAdjustment(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to save stock adjustment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Record Stock Adjustment
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
                Adjustment Type
              </label>
              <select
                value={adjustmentType}
                onChange={(e) =>
                  setAdjustmentType(e.target.value as "INCREASE" | "DECREASE")
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
                required
              >
                <option value="INCREASE" className="dark:bg-slate-900">+ Stock Increase</option>
                <option value="DECREASE" className="dark:bg-slate-900">- Stock Decrease</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Quantity Adjusted
              </label>
              <input
                type="number"
                placeholder="10"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-emerald-500"
                required
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Audit Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Damaged Goods, Annual Audit Recount, Vendor Return"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
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
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentForm;
