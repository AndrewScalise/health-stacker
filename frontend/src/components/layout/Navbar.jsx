import React from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const isPremium = user?.subscriptionStatus === "premium";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
      {/* Mobile Menu Icon */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu size={24} />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Page Title - Hidden on mobile, shown on larger screens */}
      <h1 className="hidden text-xl font-semibold md:block">
        {/* Dynamic title based on route could go here */}
        Dashboard
      </h1>

      {/* Search - Hidden on mobile */}
      <div className="hidden md:block md:flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search habits..."
            className="w-full bg-gray-50 pl-8 rounded-full"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Create New Habit Button */}
        <Button size="sm" className="hidden md:flex gap-1">
          <Plus size={16} />
          <span>New Habit</span>
        </Button>
        <Button size="icon" variant="ghost" className="md:hidden">
          <Plus size={20} />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start">
                <p className="font-medium">Habit streak achieved!</p>
                <p className="text-xs text-gray-500">
                  You've maintained Morning Meditation for 7 days!
                </p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start">
                <p className="font-medium">Don't forget your habits</p>
                <p className="text-xs text-gray-500">
                  You have 2 habits to complete today.
                </p>
                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center font-medium text-blue-600">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs font-normal text-gray-500">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/subscription">
                {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                {!isPremium && (
                  <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-600">
                    PRO
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-red-600"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
