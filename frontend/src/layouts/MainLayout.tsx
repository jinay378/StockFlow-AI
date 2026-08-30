import { useState, type ReactNode } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import AIChatDrawer from "../components/ai/AIChatDrawer";

interface Props {
  children: ReactNode;
}

function MainLayout({ children }: Props) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onOpenMobileNav={() => setIsMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {children}
        </main>
      </div>

      <AIChatDrawer />
    </div>
  );
}

export default MainLayout;
