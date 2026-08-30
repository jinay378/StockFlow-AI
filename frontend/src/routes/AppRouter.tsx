import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import InventoryPage from "../pages/InventoryPage";
import CustomersPage from "../pages/CustomersPage";
import SuppliersPage from "../pages/SuppliersPage";
import ReportsPage from "../pages/ReportsPage";
import SettingsPage from "../pages/SettingsPage";
import CategoriesPage from "../pages/CategoriesPage";
import SalesPage from "../pages/SalesPage";
import PurchasesPage from "../pages/PurchasesPage";
import StockAdjustmentPage from "../pages/StockAdjustmentPage";
import AlertsPage from "../pages/AlertsPage";
import ReorderPage from "../pages/ReorderPage";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        {/* Common Access for All Authenticated Users (Admin, Manager, Staff) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/sales" element={<SalesPage />} />
        </Route>

        {/* Operational Access (Admin & Manager Only) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/stock-adjustments" element={<StockAdjustmentPage />} />
          <Route path="/reorder-suggestions" element={<ReorderPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* Master Control (Admin Only) */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* =========================
            FALLBACK ROUTE
        ========================= */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
