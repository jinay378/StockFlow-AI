import MainLayout from "../layouts/MainLayout";

function HomePage() {
  return (
    <MainLayout>
      <h1 className="text-4xl font-bold">
        Welcome to StockFlow AI 👋
      </h1>

      <p className="mt-3 text-gray-600">
        This is your dashboard.
      </p>
    </MainLayout>
  );
}

export default HomePage;