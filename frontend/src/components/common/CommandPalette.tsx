import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  ShoppingBag,
  Users,
  Building2,
  FileText,
  Settings,
  Bell,
  Sparkles,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import { getProducts, type Product } from "../../services/product.service";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      getProducts().then(setProducts).catch(() => setProducts([]));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navItems = [
    { title: "Dashboard", subtitle: "KPIs & Overview", path: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
    { title: "Point of Sale (POS)", subtitle: "Create Sales Orders & Invoices", path: "/sales", icon: ShoppingCart, category: "Navigation" },
    { title: "Purchases & Restocking", subtitle: "Vendor Orders & Inbound Stock", path: "/purchases", icon: ShoppingBag, category: "Navigation" },
    { title: "Product Catalog", subtitle: "Manage Products & SKUs", path: "/products", icon: Package, category: "Navigation" },
    { title: "Product Categories", subtitle: "Organize Item Classifications", path: "/categories", icon: Layers, category: "Navigation" },
    { title: "Warehouse Inventory", subtitle: "Multi-location Stock Levels", path: "/inventory", icon: Boxes, category: "Navigation" },
    { title: "Stock Adjustments", subtitle: "Reconcile Quantity Discrepancies", path: "/stock-adjustments", icon: SlidersHorizontal, category: "Navigation" },
    { title: "Low Stock Alerts", subtitle: "Critical Stockout Warnings", path: "/alerts", icon: Bell, category: "Navigation" },
    { title: "AI Demand Forecasting", subtitle: "ML Reorder Recommendations", path: "/reorder-suggestions", icon: Sparkles, category: "Navigation" },
    { title: "Customers", subtitle: "Directory & Purchase History", path: "/customers", icon: Users, category: "Navigation" },
    { title: "Suppliers & Vendors", subtitle: "Vendor Directory & Contacts", path: "/suppliers", icon: Building2, category: "Navigation" },
    { title: "Reports & Analytics", subtitle: "Export Data & Financial Reports", path: "/reports", icon: FileText, category: "Navigation" },
    { title: "Account & Settings", subtitle: "Preferences & Profile", path: "/settings", icon: Settings, category: "Navigation" },
  ];

  const actionItems = [
    {
      title: "New Sale Order",
      subtitle: "Open POS register",
      action: () => {
        navigate("/sales");
        onClose();
      },
      icon: Plus,
      category: "Quick Actions",
    },
    {
      title: "Add New Product",
      subtitle: "Add SKU to catalog",
      action: () => {
        navigate("/products");
        onClose();
      },
      icon: Plus,
      category: "Quick Actions",
    },
    {
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      subtitle: "Toggle application theme",
      action: () => {
        toggleTheme();
        onClose();
      },
      icon: theme === "dark" ? Sun : Moon,
      category: "Quick Actions",
    },
  ];

  const q = query.toLowerCase().trim();

  // Filter navigation
  const filteredNav = navItems.filter(
    (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
  );

  // Filter actions
  const filteredActions = actionItems.filter(
    (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
  );

  // Filter products
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
  ).slice(0, 5);

  const totalResults = [
    ...filteredNav.map((item) => ({ ...item, type: "nav" as const })),
    ...filteredActions.map((item) => ({ ...item, type: "action" as const })),
    ...filteredProducts.map((p) => ({
      title: p.name,
      subtitle: `SKU: ${p.sku || "N/A"} • Stock: ${p.quantity} • ₹${Number(p.price).toLocaleString("en-IN")}`,
      path: "/products",
      icon: Package,
      type: "product" as const,
      category: "Products",
    })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (index: number) => {
    const item = totalResults[index];
    if (!item) return;

    if (item.type === "action" && "action" in item) {
      (item as any).action();
    } else if ("path" in item) {
      navigate((item as any).path);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults.length) % Math.max(1, totalResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/50">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search pages, products, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {totalResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Search size={28} className="mx-auto mb-2 opacity-40" />
              <p>No matching commands, pages, or products found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {totalResults.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition duration-150 ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-800/80 rounded text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      size={14}
                      className={`shrink-0 transition ${
                        isSelected ? "text-emerald-400 translate-x-0.5 opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 text-[10px]">↑</span>
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 text-[10px]">↓</span>
            <span>Select:</span>
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 text-[10px]">↵</span>
          </div>
          <span className="text-emerald-400/80 font-medium">StockFlow AI Spotlight</span>
        </div>
      </div>
    </div>
  );
}
