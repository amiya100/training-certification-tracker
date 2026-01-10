// App.tsx
import React, { useState, useEffect } from "react";
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
    // Initialize state with saved value or default
    const [activeMenuItem, setActiveMenuItem] = useState<MenuItemType>(() => {
        // Try to get saved value from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        // Validate that the saved value is a valid MenuItemType
        const validItems: MenuItemType[] = [
            "dashboard",
            "departments",
            "employees",
            "trainings",
            "enrollments",
            "certifications",
            "complianceReport",
        ];
        if (saved && validItems.includes(saved as MenuItemType)) {
            return saved as MenuItemType;
        }
        // Return default if no valid saved value
        return "dashboard";
    });

    // Save to localStorage whenever activeMenuItem changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, activeMenuItem);
    }, [activeMenuItem]);

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
            <Sidebar
                activeMenuItem={activeMenuItem}
                onMenuItemClick={setActiveMenuItem}
            />
            <div className="flex-1 flex flex-col">
                <Header activeMenuItem={activeMenuItem} />
                <main className="flex-1 overflow-auto">{renderContent()}</main>
            </div>
        </div>
    );
};

export default App;
