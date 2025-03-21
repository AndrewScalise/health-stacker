import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  ListTodo,
  Calendar,
  Settings,
  Users,
  LogOut,
  Award,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const isPremium = user?.subscriptionStatus === "premium";

  // Navigation items
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Habits", icon: ListTodo, path: "/habits" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Analytics", icon: BarChart2, path: "/analytics" },
    {
      name: "Accountability",
      icon: Users,
      path: "/accountability",
      premium: true,
    },
    { name: "Achievements", icon: Award, path: "/achievements" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  // Filter premium items if user doesn't have premium
  const filteredNavItems = navItems.filter(
    (item) => !item.premium || isPremium
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <img
              src="/assets/logo.svg"
              alt="HealthStack"
              className="h-8 w-8 mr-2"
            />
            <span className="text-xl font-bold">HealthStack</span>
          </Link>

          {/* Close button (mobile only) */}
          <button className="lg:hidden" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => !isDesktop && onClose()}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>

                  {item.premium && !isPremium && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Premium
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
