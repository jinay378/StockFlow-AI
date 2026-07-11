interface DashboardCardProps {
  title: string;
  value: string;
}

function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="text-gray-500 text-sm">{title}</h3>

      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default DashboardCard;