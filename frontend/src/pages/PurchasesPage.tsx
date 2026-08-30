import { useEffect, useState, useMemo } from "react";
import PurchaseForm from "../components/forms/PurchaseForm";
import InvoiceModal, { type InvoiceData } from "../components/common/InvoiceModal";
import { getPurchases, deletePurchase } from "../services/purchase.service";
import { getSuppliers, type Supplier } from "../services/supplier.service";
import { getProducts } from "../services/product.service";
import type { PurchaseResponse } from "../services/purchase.service";
import { ShoppingBasket, Trash2, Search, Eye } from "lucide-react";

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<InvoiceData | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesData, suppData, prodData] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getProducts(),
      ]);
      setPurchases(purchasesData);
      setSuppliers(suppData);
      setProducts(prodData);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const supplierMap = useMemo(() => {
    const map = new Map<number, string>();
    suppliers.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [suppliers]);

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete purchase order #${id}?`)) {
      return;
    }

    try {
      await deletePurchase(id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete purchase.");
    }
  };

  const handleViewReceipt = (purchase: PurchaseResponse, displayNumber?: number) => {
    setSelectedReceipt({
      id: purchase.id,
      display_number: displayNumber,
      type: "PURCHASE",
      party_name: supplierMap.get(purchase.supplier_id) || `Supplier #${purchase.supplier_id}`,
      party_type: "Supplier",
      total_amount: purchase.total_amount,
      created_at: purchase.created_at,
      items: (purchase.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: productMap.get(item.product_id) || `Product #${item.product_id}`,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter((p) => {
      const suppName = supplierMap.get(p.supplier_id)?.toLowerCase() || "";
      const pId = p.id.toString();
      return suppName.includes(q) || pId.includes(q);
    });
  }, [purchases, search, supplierMap]);

  return (
    <div className="space-y-8 p-2 pb-28">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Purchases & Restocking
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Record vendor purchase orders, receive inventory stock, and track procurement costs
        </p>
      </div>

      <PurchaseForm onPurchaseCreated={loadData} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBasket size={20} className="text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Purchase History
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              {filteredPurchases.length} orders
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        {loading && purchases.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500 mb-2" />
            <p className="text-sm">Loading purchases...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              No purchase orders found
            </p>
            <p className="text-xs mt-1">Record a purchase above to restock your inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">PO #</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4 text-center min-w-[140px] pr-8">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPurchases.map((purchase, index) => {
                  const poNum = filteredPurchases.length - index;
                  return (
                    <tr
                      key={purchase.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        #{poNum.toString().padStart(5, "0")}
                      </td>

                      <td className="p-4 font-medium text-slate-800 dark:text-white">
                        {supplierMap.get(purchase.supplier_id) || `Supplier ID #${purchase.supplier_id}`}
                      </td>

                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {purchase.items?.length || 1} item(s)
                      </td>

                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        ₹{purchase.total_amount.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(purchase.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="p-4 pr-8 text-center min-w-[140px]">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewReceipt(purchase, poNum)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                            title="View & Print PO Receipt"
                          >
                            <Eye size={14} />
                            <span>Receipt</span>
                          </button>

                          <button
                            onClick={() => handleDelete(purchase.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                            title="Delete purchase"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <InvoiceModal
        invoice={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};

export default PurchasesPage;