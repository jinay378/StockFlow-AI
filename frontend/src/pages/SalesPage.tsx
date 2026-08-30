import { useEffect, useState, useMemo } from "react";
import SaleForm from "../components/forms/SaleForm";
import InvoiceModal, { type InvoiceData } from "../components/common/InvoiceModal";
import { getSales, deleteSale } from "../services/sale.service";
import { getCustomers, type Customer } from "../services/customer.service";
import { getProducts } from "../services/product.service";
import { isStaff } from "../services/auth.service";
import { FileText, Trash2, Search, Eye } from "lucide-react";

interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
}

interface SaleResponse {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at: string;
  items: SaleItem[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, custData, prodData] = await Promise.all([
        getSales(),
        getCustomers(),
        getProducts(),
      ]);
      setSales(salesData);
      setCustomers(custData);
      setProducts(prodData);
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const customerMap = useMemo(() => {
    const map = new Map<number, string>();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete Sale #${id}?`)) return;

    try {
      await deleteSale(id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sale order.");
    }
  };

  const handleViewInvoice = (sale: SaleResponse, displayNumber?: number) => {
    setSelectedInvoice({
      id: sale.id,
      display_number: displayNumber,
      type: "SALE",
      party_name: customerMap.get(sale.customer_id) || `Customer #${sale.customer_id}`,
      party_type: "Customer",
      total_amount: sale.total_amount,
      created_at: sale.created_at,
      items: (sale.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: productMap.get(item.product_id) || `Product #${item.product_id}`,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((sale) => {
      const custName = customerMap.get(sale.customer_id)?.toLowerCase() || "";
      const saleId = sale.id.toString();
      return custName.includes(q) || saleId.includes(q);
    });
  }, [sales, search, customerMap]);

  return (
    <div className="space-y-8 p-2 pb-28">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sales Orders & POS
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Create customer sales orders, generate invoices, and manage transaction history
        </p>
      </div>

      {/* Sale Creator Form */}
      <SaleForm onSuccess={loadData} />

      {/* Sales History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Sales History
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              {filteredSales.length} total
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500"
            />
          </div>
        </div>

        {loading && sales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mb-2" />
            <p className="text-sm">Loading sales orders...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              No sales orders found
            </p>
            <p className="text-xs mt-1">Create a sale using the form above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4 text-center min-w-[140px] pr-8">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSales.map((sale, index) => {
                  const invoiceNum = filteredSales.length - index;
                  return (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      #{invoiceNum.toString().padStart(5, "0")}
                    </td>

                    <td className="p-4 font-medium text-slate-800 dark:text-white">
                      {customerMap.get(sale.customer_id) || `Customer ID #${sale.customer_id}`}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {sale.items?.length || 1} item(s)
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      ₹{sale.total_amount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(sale.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="p-4 pr-8 text-center min-w-[140px]">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(sale, invoiceNum)}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                          title="View & Print Invoice"
                        >
                          <Eye size={14} />
                          <span>Invoice</span>
                        </button>

                        {!isStaff() && (
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                            title="Delete sale"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}