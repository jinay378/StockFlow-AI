import { useRef } from "react";
import { X, Printer, CheckCircle, Package } from "lucide-react";

export interface InvoiceItem {
  id?: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  id: number;
  display_number?: number;
  type: "SALE" | "PURCHASE";
  party_name?: string;
  party_type?: "Customer" | "Supplier";
  total_amount: number;
  created_at: string;
  items: InvoiceItem[];
}

interface InvoiceModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSale = invoice.type === "SALE";
  const displayNum = (invoice.display_number ?? invoice.id).toString().padStart(5, "0");
  const dateStr = new Date(invoice.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isSale
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
              }`}
            >
              {isSale ? "Sales Invoice" : "Purchase Receipt"}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              #{displayNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-100">
          {/* Brand & Invoice Info */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                  <Package size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  StockFlow <span className="text-emerald-500">AI</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">Inventory & Supply Chain Platform</p>
              <p className="text-xs text-slate-400">support@stockflowai.com</p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isSale ? "TAX INVOICE" : "PURCHASE ORDER"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Invoice ID: #{displayNum}</p>
              <p className="text-xs text-slate-500">Date: {dateStr}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                <CheckCircle size={12} />
                <span>Status: Completed</span>
              </div>
            </div>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {invoice.party_type || (isSale ? "Billed To" : "Supplier Details")}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {invoice.party_name || (isSale ? `Customer #${invoice.id}` : `Supplier #${invoice.id}`)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Method</p>
              <p className="font-semibold text-slate-900 dark:text-white">Direct / Account</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Item / Product</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-slate-400 text-xs">{i + 1}</td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        {item.product_name || `Product ID #${item.product_id}`}
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.price.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right font-semibold">
                        ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      Standard transaction record
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Subtotal</span>
                <span>₹{invoice.total_amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Tax (GST 0%)</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-base text-slate-900 dark:text-white">
                <span>Total Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{invoice.total_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-xs text-slate-400">
            Thank you for your business! Generated by StockFlow AI.
          </div>
        </div>
      </div>
    </div>
  );
}
