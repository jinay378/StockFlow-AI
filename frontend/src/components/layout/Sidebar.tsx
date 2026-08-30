import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  Truck,
  FileText,
  Settings,
  LogOut,
  Users,
  ShoppingCart,
  ShoppingBasket,
  SlidersHorizontal,
  Bell,
  Sparkles,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import { getUserRole } from "../../services/auth.service";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: ("admin" | "manager" | "staff")[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "staff"] },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", path: "/products", icon: Package, roles: ["admin", "manager", "staff"] },
      { label: "Categories", path: "/categories", icon: Tags, roles: ["admin", "manager", "staff"] },
      { label: "Suppliers", path: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Stock Control",
    items: [
      { label: "Inventory", path: "/inventory", icon: Boxes, roles: ["admin", "manager", "staff"] },
      {
        label: "Stock Adjustments",
        path: "/stock-adjustments",
        icon: SlidersHorizontal,
        roles: ["admin", "manager"],
      },
      { label: "Low Stock Alerts", path: "/alerts", icon: Bell, roles: ["admin", "manager", "staff"] },
      { label: "AI Reorder", path: "/reorder-suggestions", icon: Sparkles, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Customers", path: "/customers", icon: Users, roles: ["admin", "manager", "staff"] },
      { label: "Sales", path: "/sales", icon: ShoppingCart, roles: ["admin", "manager", "staff"] },
      { label: "Purchases", path: "/purchases", icon: ShoppingBasket, roles: ["admin", "manager"] },
      { label: "Reports", path: "/reports", icon: FileText, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] }],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const currentRole = getUserRole();
  const currentUsername = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    onClose?.();
    navigate("/login");
  };

  // Filter navigation items by role
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(currentRole as any)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const renderContent = (isMobile = false) => (
    <>
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
        <Logo size={34} to="/dashboard" />

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {visibleGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (isMobile) onClose?.();
                    }}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2 ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500 font-medium"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`
                    }
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Role Badge & Logout Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
              {currentUsername}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {currentRole === "admin" ? "Company Admin" : currentRole === "manager" ? "Store Manager" : "Staff Member"}
            </p>
          </div>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              currentRole === "admin"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                : currentRole === "manager"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            }`}
          >
            {currentRole}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen flex-col">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <aside className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-2xl z-10 animate-slide-in">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
