import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

interface Props {
  children: React.ReactNode;
}

function MainLayout({ children }: Props) {
  return (
    <div>
      <Navbar />

      <div>
        <Sidebar />

        <main>{children}</main>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;