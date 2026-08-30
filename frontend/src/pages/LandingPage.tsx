import { useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";
import {
  Sparkles,
  ArrowRight,
  Boxes,
  ShoppingCart,
  Bell,
  Cpu,
  BarChart3,
  Package,
  TrendingUp,
  Bot,
  CheckCircle2,
  Lock,
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();

  // Smooth scroll handler taking sticky header height into account
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Logo size={40} />
          </div>

          {/* Smooth Scroll Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("analytics")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Analytics
            </button>
            <button
              onClick={() => scrollToSection("ai-copilot")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              AI Copilot
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              How It Works
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hidden sm:inline-flex text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-xl transition"
            >
              Register Account
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/20 transition hover:scale-105"
            >
              <span>Launch Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/15 to-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={14} className="animate-pulse" />
            <span>Next-Generation Inventory Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Stop Guessing. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Inventory
            </span>{" "}
            That Scales.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Eliminate stockouts, automate reorder workflows, track multi-warehouse inventory in real-time, and make data-driven decisions with built-in AI forecasting.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-base px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/25 transition hover:scale-105"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base px-8 py-4 rounded-xl border border-slate-800 transition"
            >
              <span>Login to Account</span>
            </button>
          </div>

          {/* Interactive Mockup Preview Card */}
          <div className="mt-16 rounded-2xl bg-slate-900 border border-slate-800 p-3 sm:p-4 shadow-2xl relative">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 mb-4 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 font-mono text-slate-400">app.stockflow.ai/dashboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left p-2">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-400 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">₹4,85,200</p>
                <div className="mt-2 text-[11px] text-emerald-500 font-medium">↑ 18.4% vs last month</div>
              </div>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-400 font-medium">Stock Health</p>
                <p className="text-2xl font-bold text-white mt-1">99.2% In-Stock</p>
                <div className="mt-2 text-[11px] text-teal-400 font-medium">2 low stock items flagged</div>
              </div>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
                <p className="text-xs text-slate-400 font-medium">AI Smart Forecast</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">14-Day Velocity</p>
                <div className="mt-2 text-[11px] text-slate-400 font-medium">Auto-reorder configured</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1. FEATURES SECTION                                                       */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Engineered For Growth
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Everything your warehouse and retail operations need
          </p>
          <p className="text-slate-400 text-sm mt-3">
            Replace clunky spreadsheets and outdated legacy tools with a unified intelligent SaaS platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition">
              <Boxes size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live Inventory Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track multi-warehouse stock allocations in real time. Record stock adjustments, transfers, and safety levels with complete audit trails.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Reorder Suggestions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Moving-average predictive algorithms calculate daily sales run-rates and lead times to generate precise restocking orders before shortages occur.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition">
              <ShoppingCart size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sales POS & Invoicing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create multi-item POS sales orders with automatic stock deductions, instant customer invoicing, and professional PDF receipt generation.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Financial Velocity</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Interactive monthly revenue charts, purchase trends, category distribution graphs, and automated PDF executive reports.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition">
              <Bell size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Low Stock Alerts</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time notifications for critical and low threshold items with severity classification to prevent lost customer sales.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition group">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2FA Mobile OTP Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Two-Factor Authentication with 6-digit one-time passcodes sent to registered mobile phones protects customer data and company records from breaches.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ANALYTICS SECTION                                                      */}
      {/* ========================================================================= */}
      <section id="analytics" className="py-24 bg-slate-900/40 border-y border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <BarChart3 size={13} />
              <span>Real-Time Business Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Live Financial Velocity & Stock Analytics
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Get 360-degree visibility over cashflow, gross margins, top customer lifetime value, and warehouse valuation.
            </p>
          </div>

          {/* Analytics Feature Showcase Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <p className="text-3xl font-extrabold text-emerald-400">₹10.18L</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                Total Inventory Value
              </p>
              <p className="text-[11px] text-emerald-500/80 mt-1">Real-time dynamic valuation</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <p className="text-3xl font-extrabold text-cyan-400">99.8%</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                Stock Count Accuracy
              </p>
              <p className="text-[11px] text-cyan-500/80 mt-1">Synchronized POS transactions</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <p className="text-3xl font-extrabold text-blue-400">4.8x</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                Faster Purchase Cycles
              </p>
              <p className="text-[11px] text-blue-500/80 mt-1">Automated PO recommendations</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <p className="text-3xl font-extrabold text-teal-400">0%</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                Unplanned Stockouts
              </p>
              <p className="text-[11px] text-teal-500/80 mt-1">Predictive safety buffer alerts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900/90 border border-slate-800 p-8 rounded-3xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Executive Reporting</span>
              <h3 className="text-2xl font-bold text-white mt-1">1-Click PDF Report Exports</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Generate branded PDF executive summaries, balance velocity sheets, and vendor purchase logs filtered by any single day, last 30 days, or custom date ranges.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  Monthly revenue vs purchase expenditure trends
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  Category market share distribution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  Top 5 highest margin products and best customer rankings
                </li>
              </ul>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span>Financial Velocity Breakdown</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Electronics & Devices</span>
                    <span className="font-bold text-emerald-400">₹1,85,000 (62%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[62%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Accessories & Peripherals</span>
                    <span className="font-bold text-teal-400">₹64,639 (26%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full w-[26%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Office Supplies</span>
                    <span className="font-bold text-cyan-400">₹20,000 (12%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-cyan-400 h-2 rounded-full w-[12%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. AI COPILOT SECTION                                                     */}
      {/* ========================================================================= */}
      <section id="ai-copilot" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
              <Bot size={14} />
              <span>AI Inventory Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Meet your 24/7 AI Supply Chain Copilot
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Ask natural language questions about your business operations and get instant answers backed by live inventory database queries.
            </p>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles size={14} />
                  "Which items should I reorder from suppliers today?"
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  AI scans sales run rates and flags products whose remaining stock will deplete before the supplier delivery lead time.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                  <Bot size={14} />
                  "Who is our top spending customer this month?"
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Instant breakdown of customer order frequencies, totals, and average ticket sizes.
                </p>
              </div>
            </div>
          </div>

          {/* AI Chat Window Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">StockFlow Copilot</h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Online & Connected
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Gemini 2.5 Flash</span>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl rounded-tr-none text-slate-300 max-w-[85%] ml-auto border border-slate-800">
                Are there any critical stock shortages right now?
              </div>
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl rounded-tl-none text-slate-200 max-w-[90%] border border-emerald-500/30">
                <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                  <Sparkles size={12} />
                  Stock Alert Report:
                </p>
                <p>Yes, <strong>Wireless Mouse Pro</strong> has only <strong>2 units remaining</strong> (below minimum 10). I recommend placing a purchase order for <strong>25 units</strong> with TechSupply Co.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Try AI Copilot on Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS SECTION                                                   */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-24 bg-slate-900/30 border-y border-slate-800 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Effortless Onboarding
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Ready in 3 Simple Steps
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Deploy StockFlow AI for your company in minutes with zero setup friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center hover:border-slate-700 transition">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-lg mb-4 shadow-lg shadow-emerald-500/20">
                1
              </span>
              <h3 className="text-lg font-bold text-white mb-2">Create Account & Add Catalog</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register with 2FA mobile security. Configure SKUs, base purchase prices, selling prices, and assign minimum threshold quantities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center hover:border-slate-700 transition">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500 text-slate-950 font-extrabold text-lg mb-4 shadow-lg shadow-teal-500/20">
                2
              </span>
              <h3 className="text-lg font-bold text-white mb-2">Record Daily Transactions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute customer sales via POS and vendor purchases with instant automatic stock deductions and invoice generation.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center hover:border-slate-700 transition">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-lg mb-4 shadow-lg shadow-cyan-500/20">
                3
              </span>
              <h3 className="text-lg font-bold text-white mb-2">Unlock AI Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review automated reorder warnings, ask the AI Copilot natural language questions, and optimize supply chain profit margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-10 sm:p-14 text-center text-slate-950 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to modernise your inventory management?
            </h2>
            <p className="text-slate-900 font-medium text-base sm:text-lg max-w-2xl mx-auto mt-4">
              Get full control of your products, sales, and warehouse supply chain today with 2FA protection.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm px-8 py-3.5 rounded-full shadow-lg transition hover:scale-105"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm px-8 py-3.5 rounded-full shadow-lg transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-emerald-400" />
            <span className="font-bold text-slate-300">StockFlow AI</span>
            <span>— Intelligent Inventory Management SaaS</span>
          </div>
          <p>© {new Date().getFullYear()} StockFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
