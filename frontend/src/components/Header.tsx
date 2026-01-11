import React from "react";
import {
  Settings,
  Bell,
  BarChart,
  Users,
  BookOpen,
  ClipboardList,
  Award,
  Building2,
} from "lucide-react";
import { type MenuItemType } from "../App";

interface HeaderProps {
  activeMenuItem: MenuItemType;
}

const Header: React.FC<HeaderProps> = ({ activeMenuItem }) => {
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("activeMenuItem");
    window.location.reload();
  };

  const getPageConfig = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return {
          title: "HR Management Dashboard",
          description: "Overview of your training and certification programs",
          icon: <BarChart size={20} className="text-orange-400" />,
          notifications: 3,
        };
      case "employees":
        return {
          title: "Employee Management",
          description:
            "Manage employee information, assignments, and departments",
          icon: <Users size={20} className="text-blue-400" />,
          notifications: 5,
        };
      case "trainings":
        return {
          title: "Training Programs",
          description: "Create, manage, and track training programs",
          icon: <BookOpen size={20} className="text-emerald-400" />,
          notifications: 2,
        };
      case "enrollments":
        return {
          title: "Training Enrollments",
          description: "Track and manage employee training enrollments",
          icon: <ClipboardList size={20} className="text-purple-400" />,
          notifications: 4,
        };
      case "certifications":
        return {
          title: "Certifications Management",
          description:
            "View and manage employee certifications and expirations",
          icon: <Award size={20} className="text-yellow-400" />,
          notifications: 6,
        };
      case "departments":
        return {
          title: "Department Management",
          description:
            "Manage organizational departments and team structures",
          icon: <Building2 size={20} className="text-indigo-400" />,
          notifications: 1,
        };
      default:
        return {
          title: "HR Management Dashboard",
          description: "Overview of your training and certification programs",
          icon: <BarChart size={20} className="text-orange-400" />,
          notifications: 3,
        };
    }
  };

  const pageConfig = getPageConfig();

  return (
    <header className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border-b border-white/20 px-5 py-3">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-800/50 rounded-lg border border-white/10">
            {pageConfig.icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {pageConfig.title}
            </h2>
            <p className="text-xs text-gray-300">
              {pageConfig.description}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-4">
          <button className="p-1.5 bg-gray-700 rounded-lg border border-white/20 relative">
            <Bell size={16} className="text-gray-200" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {pageConfig.notifications}
            </span>
          </button>

          <button className="p-1.5 bg-gray-700 rounded-lg border border-white/20">
            <Settings size={16} className="text-gray-200" />
          </button>

          {/* USER / LOGOUT */}
          <div
            onClick={handleLogout}
            className="flex items-center space-x-2 cursor-pointer"
            title="Logout"
          >
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-white/20"
            />
            <div className="hidden md:block">
              <p className="text-sm text-white">Alex Johnson</p>
              <p className="text-xs text-gray-300">HR Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
