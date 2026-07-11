import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="flex items-center gap-4">
        <Search />
        <Bell />
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
          J
        </div>
      </div>
    </header>
  );
}

export default Navbar;