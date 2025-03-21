import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - always visible on desktop, toggleable on mobile */}
      <Sidebar
        isOpen={isDesktop || sidebarOpen}
        onClose={() => !isDesktop && setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} HealthStack
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
