interface DashboardCardProps {
  title: string;
  value: string;
}

function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-3 text-3xl font-bold">{value}</h2>
    </div>
  );
}

export default DashboardCard;