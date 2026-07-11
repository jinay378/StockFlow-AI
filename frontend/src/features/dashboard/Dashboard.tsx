import DashboardCard from "./components/DashboardCard";

function Dashboard() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <DashboardCard
          title="Revenue"
          value="₹1,25,000"
        />

        <DashboardCard
          title="Products"
          value="1,250"
        />

        <DashboardCard
          title="Orders"
          value="245"
        />

        <DashboardCard
          title="Low Stock"
          value="18"
        />

      </div>

    </div>
  );
}

export default Dashboard;