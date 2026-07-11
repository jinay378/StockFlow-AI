import DashboardCard from "./components/DashboardCard";

function Dashboard() {
  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <DashboardCard
          title="Revenue"
          value="₹1,25,000"
          color="text-green-600"
        />

        <DashboardCard
          title="Products"
          value="1250"
          color="text-blue-600"
        />

        <DashboardCard
          title="Orders"
          value="245"
          color="text-purple-600"
        />

        <DashboardCard
          title="Low Stock"
          value="18"
          color="text-red-600"
        />

      </div>
    </div>
  );
}

export default Dashboard;