import { useState, useEffect } from "react";
import { createSale } from "../../services/sale.service";
import { getCustomers, type Customer } from "../../services/customer.service";
import { getProducts } from "../../services/product.service";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

interface SaleLineItem {
  product_id: number;
  quantity: number;
  price: number;
  available_stock: number;
}

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export default function SaleForm({ onSuccess }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [customerId, setCustomerId] = useState<number | string>("");
  const [items, setItems] = useState<SaleLineItem[]>([
    { product_id: 0, quantity: 1, price: 0, available_stock: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([custData, prodData]) => {
        setCustomers(custData);
        setProducts(prodData);
        if (custData.length > 0) setCustomerId(custData[0].id);
        if (prodData.length > 0) {
          setItems([
            {
              product_id: prodData[0].id,
              quantity: 1,
              price: prodData[0].price,
              available_stock: prodData[0].quantity,
            },
          ]);
        }
      })
      .catch((err) => console.error("Failed to load initial data:", err));
  }, []);

  const handleProductChange = (index: number, productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItems = [...items];
    newItems[index] = {
      product_id: prod.id,
      quantity: 1,
      price: prod.price,
      available_stock: prod.quantity,
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, qty);
    setItems(newItems);
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        product_id: defaultProd.id,
        quantity: 1,
        price: defaultProd.price,
        available_stock: defaultProd.quantity,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerId) {
      setErrorMsg("Please select a customer.");
      return;
    }

    if (items.length === 0 || items.some((it) => !it.product_id || it.quantity <= 0)) {
      setErrorMsg("Please add at least one valid product item.");
      return;
    }

    try {
      setLoading(true);
      await createSale({
        customer_id: Number(customerId),
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })),
      });

      alert("Sale order created successfully! 🎉");
      onSuccess();

      // Reset form
      if (products.length > 0) {
        setItems([
          {
            product_id: products[0].id,
            quantity: 1,
            price: products[0].price,
            available_stock: products[0].quantity,
          },
        ]);
      }
    } catch (err: any) {
      console.error("Sale creation error:", err);
      setErrorMsg(
        err?.response?.data?.detail || "Failed to record sale. Check stock levels."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShoppingCart size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Create New Sale
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record a sale transaction and automatically update inventory stock
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Grand Total</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {errorMsg}
        </div>
      )}

      {/* Customer Selection */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-sm text-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select Customer
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Items to Sell
          </label>
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60"
            >
              {/* Product selector */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={item.product_id}
                  onChange={(e) =>
                    handleProductChange(idx, Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity}) — ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="w-24">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(idx, Number(e.target.value))
                  }
                  placeholder="Qty"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-800 dark:text-white text-center focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Unit Price */}
              <div className="w-28 text-right text-xs text-slate-500 dark:text-slate-400">
                <span>₹{item.price.toLocaleString()} each</span>
              </div>

              {/* Subtotal */}
              <div className="w-32 text-right font-bold text-sm text-slate-800 dark:text-slate-200">
                ₹{(item.quantity * item.price).toLocaleString("en-IN")}
              </div>

              {/* Remove */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition"
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-6 py-2.5 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
        >
          {loading ? "Processing Sale..." : "Complete Sale Order"}
        </button>
      </div>
    </form>
  );
}