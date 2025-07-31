import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PageMetadata from "../PageMetadata";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PageMetadata />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;