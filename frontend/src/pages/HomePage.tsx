import MainLayout from "../layouts/MainLayout";
import Dashboard from "../features/dashboard/Dashboard";

function HomePage() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}

export default HomePage;