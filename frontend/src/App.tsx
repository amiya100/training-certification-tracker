// App.tsx
import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Trainings from "./pages/Trainings";
import Enrollments from "./pages/Enrollments";
import Certifications from "./pages/Certifications";
import ComplianceReport from "./pages/ComplianceReport";

export type MenuItemType =
  | "dashboard"
  | "departments"
  | "employees"
  | "trainings"
  | "enrollments"
  | "certifications"
  | "complianceReport";

const STORAGE_KEY = "activeMenuItem";

const App: React.FC = () => {
  /* ================= AUTH STATE ================= */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ================= MENU STATE ================= */
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItemType>("dashboard");

  /* ================= INITIAL SETUP ================= */
  useEffect(() => {
    // Always reset auth on app start so login appears first
    localStorage.removeItem("isAuthenticated");

    const savedMenu = localStorage.getItem(STORAGE_KEY) as MenuItemType;
    const validItems: MenuItemType[] = [
      "dashboard",
      "departments",
      "employees",
      "trainings",
      "enrollments",
      "certifications",
      "complianceReport",
    ];
    if (savedMenu && validItems.includes(savedMenu)) {
      setActiveMenuItem(savedMenu);
    }
  }, []);

  /* ================= SAVE MENU ================= */
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, activeMenuItem);
    }
  }, [activeMenuItem, isAuthenticated]);

  /* ================= SHOW LOGIN IF NOT AUTH ================= */
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={() => setIsAuthenticated(true)}
      />
    );
  }

  /* ================= RENDER MAIN APP ================= */
  const renderContent = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <Dashboard />;
      case "departments":
        return <Departments />;
      case "employees":
        return <Employees />;
      case "trainings":
        return <Trainings />;
      case "enrollments":
        return <Enrollments />;
      case "certifications":
        return <Certifications />;
      case "complianceReport":
        return <ComplianceReport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <Sidebar activeMenuItem={activeMenuItem} onMenuItemClick={setActiveMenuItem} />
      <div className="flex-1 flex flex-col">
        <Header activeMenuItem={activeMenuItem} />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
