import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getUserRole } from "../services/auth.service";

interface Props {
  allowedRoles?: ("admin" | "manager" | "staff")[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = getUserRole();
    if (!allowedRoles.includes(currentRole as any)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
