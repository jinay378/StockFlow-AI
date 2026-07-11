function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600">
          StockFlow AI
        </h1>

        <p className="mt-4 text-gray-600">
          AI Powered Inventory Management Platform
        </p>

        <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default LandingPage;