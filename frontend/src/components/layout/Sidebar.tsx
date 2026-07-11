import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Truck,
  FileText,
  Settings,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Package, label: "Products" },
  { icon: Boxes, label: "Inventory" },
  { icon: Users, label: "Customers" },
  { icon: Truck, label: "Suppliers" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">StockFlow AI</h1>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full rounded-lg px-4 py-3 hover:bg-slate-700 transition"
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;