interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: string;
  trendType?: "up" | "down";
}

function DashboardCard({
  title,
  value,
  icon,
  color = "#2563eb",
  trend,
  trendType,
}: DashboardCardProps) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        bg-white
        dark:bg-slate-900
        p-6
        shadow-sm
        border
        border-slate-100
        dark:border-slate-800
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:shadow-xl
        hover:border-slate-300
        dark:hover:border-slate-700
        group
      "
    >
      {/* Left Border accent */}
      <div
        className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl transition-all duration-300 group-hover:w-2"
        style={{
          backgroundColor: color,
        }}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
            {value}
          </h2>

          {trend && (
            <div
              className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                trendType === "up"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {trendType === "up" ? "↑" : "↓"} {trend}
            </div>
          )}
        </div>

        {icon && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{
              backgroundColor: `${color}18`,
              color: color,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Decorative Circle */}
      <div
        className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-5 pointer-events-none"
        style={{
          backgroundColor: color,
        }}
      />
    </div>
  );
}

export default DashboardCard;