import { useRef } from "react";
import { X, Printer, CheckCircle2, Calendar, Receipt } from "lucide-react";

export interface InvoiceSaleItem {
  id?: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface InvoiceSaleData {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at?: string;
  items?: InvoiceSaleItem[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: InvoiceSaleData | null;
  customerName?: string;
  productMap?: Map<number, { name: string; sku?: string }>;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  sale,
  customerName,
  productMap,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const invoiceNumber = `INV-${sale.id.toString().padStart(6, "0")}`;
  const formattedDate = new Date(sale.created_at || Date.now()).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const lines = [
      `*** StockFlow AI Invoice: ${invoiceNumber} ***`,
      `Date: ${formattedDate}`,
      `Customer: ${customerName || `Customer #${sale.customer_id}`}`,
      `Total: Rs. ${sale.total_amount.toLocaleString("en-IN")}`,
      `Items:`,
    ];
    sale.items?.forEach((item: InvoiceSaleItem, idx: number) => {
      const prodName = productMap?.get(item.product_id)?.name || `Product #${item.product_id}`;
      lines.push(`${idx + 1}. ${prodName} x ${item.quantity} = Rs. ${item.subtotal.toLocaleString("en-IN")}`);
    });
    navigator.clipboard.writeText(lines.join("\n"));
    alert("Invoice summary copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:fixed">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Action Header (Hidden during Print) */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Receipt size={18} />
            <span>Tax Invoice Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDetails}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Copy Text
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div
          ref={printRef}
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 print:text-black print:p-0 print:m-0"
        >
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 print:border-slate-300 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
                  SF
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white print:text-black">
                  StockFlow <span className="text-emerald-400 print:text-emerald-700">AI</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Enterprise Cloud Inventory & POS Solutions
              </p>
              <p className="text-[11px] text-slate-500 print:text-slate-500 mt-0.5">
                GSTIN: 27AABCS1429B1Z • Mumbai, India
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 print:bg-emerald-50 text-emerald-400 print:text-emerald-800 border border-emerald-500/20 rounded-md text-xs font-bold uppercase tracking-wider mb-1.5">
                TAX INVOICE
              </span>
              <div className="text-sm font-mono font-bold text-white print:text-black">
                {invoiceNumber}
              </div>
              <div className="text-xs text-slate-400 print:text-slate-600 mt-1 flex items-center gap-1 sm:justify-end">
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Billed To / Customer Box */}
          <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 print:text-slate-500 block mb-1">
                Billed To
              </span>
              <div className="font-bold text-sm text-white print:text-black">
                {customerName || `Customer #${sale.customer_id}`}
              </div>
              <div className="text-slate-400 print:text-slate-600 mt-0.5">
                Account ID: CUST-{sale.customer_id.toString().padStart(4, "0")}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 print:text-slate-500 block mb-1">
                Payment Status
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 print:text-emerald-700 font-semibold text-xs border border-emerald-500/30">
                <CheckCircle2 size={12} />
                <span>Paid / Completed</span>
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-800/80 print:bg-slate-100 text-slate-300 print:text-slate-700 font-semibold border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item: InvoiceSaleItem, idx: number) => {
                    const prod = productMap?.get(item.product_id);
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-white print:text-black">
                            {prod ? prod.name : `Product #${item.product_id}`}
                          </div>
                          {prod?.sku && (
                            <span className="text-[10px] font-mono text-slate-400 print:text-slate-500">
                              SKU: {prod.sku}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-medium text-white print:text-black">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-slate-300 print:text-slate-700">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-bold text-white print:text-black">
                          ₹{Number(item.subtotal).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      Standard Order Transaction • Total: ₹{sale.total_amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-0.5">
              <p>Thank you for your business!</p>
              <p>Terms: Goods once sold will only be replaced per company policy.</p>
            </div>

            <div className="w-full sm:w-64 bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 print:text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-white print:text-black">
                  ₹{sale.total_amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 print:text-slate-600">
                <span>Taxes & GST (Included):</span>
                <span className="font-medium text-emerald-400 print:text-emerald-700">₹0.00</span>
              </div>
              <div className="border-t border-slate-800 print:border-slate-300 pt-2 flex justify-between text-sm font-bold text-white print:text-black">
                <span>Grand Total:</span>
                <span className="text-emerald-400 print:text-emerald-700 font-mono">
                  ₹{sale.total_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
