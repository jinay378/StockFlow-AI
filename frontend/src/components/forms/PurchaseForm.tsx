import { useEffect, useState } from "react";
import { createPurchase } from "../../services/purchase.service";
import { getSuppliers } from "../../services/supplier.service";
import { getProducts } from "../../services/product.service";
import {
  Truck,
  Package,
  Hash,
  IndianRupee,
  PlusCircle,
  Sparkles,
  Calculator,
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  sku?: string;
  cost_price?: number;
  price?: number;
}

interface PurchaseFormProps {
  onPurchaseCreated: () => void;
}

const PurchaseForm = ({ onPurchaseCreated }: PurchaseFormProps) => {
  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to load suppliers", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    if (!prodId) return;

    const selectedProd = products.find((p) => p.id === Number(prodId));
    if (selectedProd) {
      if (selectedProd.cost_price && !price) {
        setPrice(selectedProd.cost_price.toString());
      } else if (selectedProd.price && !price) {
        setPrice(selectedProd.price.toString());
      }
    }
  };

  const qtyNum = parseFloat(quantity) || 0;
  const priceNum = parseFloat(price) || 0;
  const totalEstimatedCost = qtyNum * priceNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!supplierId || !productId || !quantity || !price) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (qtyNum <= 0 || priceNum <= 0) {
      setErrorMessage("Quantity and price must be greater than 0.");
      return;
    }

    try {
      setLoading(true);
      await createPurchase({
        supplier_id: Number(supplierId),
        items: [
          {
            product_id: Number(productId),
            quantity: qtyNum,
            price: priceNum,
          },
        ],
      });

      setSuccessMessage("Purchase order created and stock received successfully!");
      setSupplierId("");
      setProductId("");
      setQuantity("");
      setPrice("");

      onPurchaseCreated();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.detail || "Failed to create purchase order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PlusCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Create Purchase & Restock
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive inventory stock from suppliers and record procurement expenditure
            </p>
          </div>
        </div>

        {totalEstimatedCost > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <Calculator size={15} />
            <span>Estimated Total: ₹{totalEstimatedCost.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-medium animate-shake">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <Sparkles size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select Supplier
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Truck size={16} />
              </div>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                required
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-500">
                  Choose a supplier...
                </option>
                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                    className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select Product
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Package size={16} />
              </div>
              <select
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                required
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-500">
                  Choose a product to restock...
                </option>
                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  >
                    {product.name} {product.sku ? `(${product.sku})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Quantity Received
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash size={16} />
              </div>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Unit Purchase Price (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IndianRupee size={16} />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 450.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Recording Purchase Order...</span>
            </div>
          ) : (
            <>
              <PlusCircle size={17} />
              <span>
                Record Purchase Order {totalEstimatedCost > 0 ? `(₹${totalEstimatedCost.toLocaleString("en-IN")})` : ""}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PurchaseForm;
