import { useEffect, useRef, useState } from "react";
import DashboardCard from "./DashboardCard";
import RecentSales from "./components/RecentSales";
import TopSellingProducts from "./components/TopSellingProducts";
import BestCustomers from "./components/BestCustomers";
import InventoryAnalyticsWidget from "./components/InventoryAnalytics";
import SalesChart from "../../components/Charts/SalesChart";
import PurchaseChart from "../../components/Charts/PurchaseChart";
import CategoryPieChart from "../../components/Charts/CategoryPieChart";
import SalesByCategoryChart from "../../components/Charts/SalesByCategoryChart";

import {
  getDashboard,
  getTopSellingProducts,
  getBestCustomers,
  getRecentSales,
  type DashboardData,
} from "../../services/dashboard.service";
import { exportDashboardReport } from "../../utils/exportDashboardReport";

import {
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
  Download,
  Calendar as CalendarIcon,
  Layers,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

const periods = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Year", value: "year" },
];

function Dashboard() {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [username, setUsername] = useState("Admin");

  // Custom Date Picker State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [selectedSingleDate, setSelectedSingleDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUsername(storedUser);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const summary = await getDashboard(period);
      setData(summary);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const handleApplySingleDate = (dateVal?: string) => {
    const target = dateVal || selectedSingleDate;
    if (!target) return;
    setPeriod(target);
    setIsDatePickerOpen(false);
  };

  const handleApplyRange = () => {
    if (!rangeStart || !rangeEnd) {
      alert("Please select both start and end dates.");
      return;
    }
    if (rangeStart > rangeEnd) {
      alert("Start date cannot be after end date.");
      return;
    }
    setPeriod(`custom:${rangeStart}:${rangeEnd}`);
    setIsDatePickerOpen(false);
  };

  const handleClearCustomDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPeriod("all");
  };

  const isCustomDate =
    period !== "all" &&
    period !== "today" &&
    period !== "7days" &&
    period !== "30days" &&
    period !== "year";

  const getActivePeriodLabel = () => {
    const found = periods.find((p) => p.value === period);
    if (found) return found.label;
    if (period.startsWith("custom:")) {
      const parts = period.split(":");
      return `${parts[1]} to ${parts[2]}`;
    }
    if (period.length === 10 && period.includes("-")) {
      return `Date: ${period}`;
    }
    return period;
  };

  const handleExportPDF = async () => {
    if (!data) return;
    try {
      setExporting(true);
      const [topProd, bestCust, recSales] = await Promise.all([
        getTopSellingProducts(period),
        getBestCustomers(period),
        getRecentSales(period),
      ]);

      exportDashboardReport({
        period: period,
        summary: {
          total_products: data.total_products,
          total_categories: data.total_categories,
          total_suppliers: data.total_suppliers,
          total_customers: data.total_customers,
          total_sales: data.total_sales,
          total_purchases: data.total_purchases,
          low_stock_products: data.low_stock_products,
          today_sales: data.today_sales,
          today_purchases: data.today_purchases,
        },
        topProducts: topProd,
        bestCustomers: bestCust,
        recentSales: recSales,
      });
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to generate PDF report.");
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-fade-in pb-10">
        {/* Skeleton Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="h-7 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Controls with high stacking context */}
      <div className="relative z-30 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-down">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Synchronized
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {username}!
            <Sparkles size={22} className="text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your live inventory status, financial velocity, and stock performance
          </p>

          {/* Active Custom Filter Badge */}
          {isCustomDate && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-fade-in">
              <CalendarIcon size={13} />
              <span>Filtering for {getActivePeriodLabel()}</span>
              <button
                onClick={() => setPeriod("all")}
                className="ml-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 p-0.5 rounded transition"
                title="Reset to All Time"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-40">
          {/* Period Selector Bar */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm relative z-40">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  period === p.value
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {p.label}
              </button>
            ))}

            {/* Custom Date Picker Trigger Button */}
            <div className="relative z-50" ref={popoverRef}>
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ml-1 ${
                  isCustomDate
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Filter by specific day or custom date range"
              >
                <CalendarIcon size={14} className={isCustomDate ? "text-slate-950" : "text-slate-400"} />
                <span>
                  {isCustomDate ? getActivePeriodLabel() : "Pick Date"}
                </span>
                {isCustomDate ? (
                  <span
                    onClick={handleClearCustomDate}
                    className="hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </span>
                ) : (
                  <ChevronDown size={12} className="opacity-70" />
                )}
              </button>

              {/* Date Picker Popover Dropdown */}
              {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-scale-up">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Filter by Date
                      </span>
                    </div>
                    <button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Mode Selector (Single Day vs Date Range) */}
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl my-3">
                    <button
                      onClick={() => setDateMode("single")}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                        dateMode === "single"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Specific Day
                    </button>
                    <button
                      onClick={() => setDateMode("range")}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                        dateMode === "range"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Date Range
                    </button>
                  </div>

                  {/* Single Day Picker Form */}
                  {dateMode === "single" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Select Day
                        </label>
                        <input
                          type="date"
                          value={selectedSingleDate}
                          onChange={(e) => setSelectedSingleDate(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>

                      {/* Quick Shortcut Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const todayStr = new Date().toISOString().split("T")[0];
                            setSelectedSingleDate(todayStr);
                            handleApplySingleDate(todayStr);
                          }}
                          className="flex-1 py-1.5 px-2 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 1);
                            const yestStr = d.toISOString().split("T")[0];
                            setSelectedSingleDate(yestStr);
                            handleApplySingleDate(yestStr);
                          }}
                          className="flex-1 py-1.5 px-2 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
                        >
                          Yesterday
                        </button>
                      </div>

                      <button
                        onClick={() => handleApplySingleDate()}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Check size={14} />
                        <span>Filter by This Day</span>
                      </button>
                    </div>
                  ) : (
                    /* Date Range Picker Form */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={rangeStart}
                          onChange={(e) => setRangeStart(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>

                      <button
                        onClick={handleApplyRange}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Check size={14} />
                        <span>Apply Date Range</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition border border-slate-700 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{exporting ? "Generating PDF..." : "Export Report"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with lower z-index */}
      <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up delay-75">
        <div className="transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/5">
          <DashboardCard
            title="Total Sales Revenue"
            value={`₹${(data?.total_sales || 0).toLocaleString("en-IN")}`}
            icon={<DollarSign size={24} />}
            color="#10b981"
            trend={`${data?.today_sales ? `₹${data.today_sales.toLocaleString("en-IN")} today` : "Active"}`}
            trendType="up"
          />
        </div>

        <div className="transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/5">
          <DashboardCard
            title="Total Purchases"
            value={`₹${(data?.total_purchases || 0).toLocaleString("en-IN")}`}
            icon={<ShoppingCart size={24} />}
            color="#3b82f6"
            trend={`${data?.today_purchases ? `₹${data.today_purchases.toLocaleString("en-IN")} today` : "Active"}`}
            trendType="up"
          />
        </div>

        <div className="transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-500/5">
          <DashboardCard
            title="Catalog Products"
            value={data?.total_products || 0}
            icon={<Package size={24} />}
            color="#8b5cf6"
            trend={`${data?.total_categories || 0} Categories`}
            trendType="up"
          />
        </div>

        <div className="transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-red-500/5">
          <DashboardCard
            title="Low Stock Items"
            value={data?.low_stock_products || 0}
            icon={<TriangleAlert size={24} />}
            color="#ef4444"
            trend={
              (data?.low_stock_products || 0) > 0
                ? "Action Required"
                : "Healthy Stock"
            }
            trendType={(data?.low_stock_products || 0) > 0 ? "down" : "up"}
          />
        </div>
      </div>

      {/* Secondary Stats Row with Staggered Entrance */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-slide-up delay-150">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Suppliers</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{data?.total_suppliers || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Customers</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{data?.total_customers || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Categories</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{data?.total_categories || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Today's Revenue</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">₹{(data?.today_sales || 0).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Inventory Analytics */}
      <div className="animate-slide-up delay-200">
        <InventoryAnalyticsWidget />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-slide-up delay-300">
        <SalesChart period={period} />
        <PurchaseChart period={period} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-slide-up delay-400">
        <SalesByCategoryChart period={period} />
        <CategoryPieChart period={period} />
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-slide-up delay-500">
        <TopSellingProducts period={period} />
        <BestCustomers period={period} />
      </div>

      {/* Recent Sales Activity */}
      <div className="animate-slide-up delay-500">
        <RecentSales period={period} />
      </div>
    </div>
  );
}

export default Dashboard;