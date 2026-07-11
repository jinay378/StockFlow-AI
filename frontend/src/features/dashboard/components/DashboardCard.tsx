interface DashboardCardProps {
  title: string;
  value: string;
  color: string;
}

function DashboardCard({
  title,
  value,
  color,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}

export default DashboardCard;