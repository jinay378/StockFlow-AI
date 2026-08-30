import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getLowStockAlerts } from "../../services/dashboard.service";
import { getProfile } from "../../services/auth.service";
import { useTheme } from "../../contexts/ThemeContext";
import CommandPalette from "../common/CommandPalette";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/suppliers": "Suppliers",
  "/inventory": "Inventory",
  "/stock-adjustments": "Stock Adjustments",
  "/alerts": "Low Stock Alerts",
  "/reorder-suggestions": "AI Reorder Suggestions",
  "/customers": "Customers",
  "/sales": "Sales",
  "/purchases": "Purchases",
  "/reports": "Reports",
  "/settings": "Settings",
};

interface NavbarProps {
  onOpenMobileNav?: () => void;
}

function Navbar({ onOpenMobileNav }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [alertCount, setAlertCount] = useState(0);
  const [username, setUsername] = useState("");
  const [showBadge, setShowBadge] = useState(
    localStorage.getItem("hideStockBadge") !== "true"
  );
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const title = pageTitles[location.pathname] ?? "StockFlow AI";

  // Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    getLowStockAlerts()
      .then((alerts) => setAlertCount(alerts.length))
      .catch(() => setAlertCount(0));

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      getProfile()
        .then((profile) => setUsername(profile.username))
        .catch(() => setUsername(""));
    }
  }, [location.pathname]);

  useEffect(() => {
    const handlePreferenceChange = () => {
      setShowBadge(localStorage.getItem("hideStockBadge") !== "true");
    };

    window.addEventListener(
      "stock-badge-preference-changed",
      handlePreferenceChange
    );

    return () =>
      window.removeEventListener(
        "stock-badge-preference-changed",
        handlePreferenceChange
      );
  }, []);

  const initial = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Spotlight Search Input Trigger */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl px-3 py-1.5 w-64 text-left transition border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <Search size={15} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Quick search...
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-2xs">
                Ctrl
              </kbd>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-2xs">
                K
              </kbd>
            </div>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} className="text-amber-400" />}
          </button>

          {/* Low Stock Alerts Bell */}
          <button
            onClick={() => navigate("/alerts")}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Low stock alerts"
          >
            <Bell size={19} />
            {showBadge && alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center animate-pulse">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          {/* User Account Avatar */}
          <button
            onClick={() => navigate("/settings")}
            className="w-8.5 h-8.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center hover:bg-emerald-400 shadow-sm transition-transform hover:scale-105"
            title={username || "Account"}
          >
            {initial}
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}

export default Navbar;
