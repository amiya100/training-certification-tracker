// App.tsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Trainings from "./pages/Trainings";
import Enrollments from "./pages/Enrollments";
import Certifications from "./pages/Certifications";
// import Employees from "./pages/Employees";
// import Trainings from "./pages/Trainings";
// import Enrollments from "./pages/Enrollments";
// import Certifications from "./pages/Certifications";

export type MenuItemType =
    | "dashboard"
    | "departments"
    | "employees"
    | "trainings"
    | "enrollments"
    | "certifications";

const App: React.FC = () => {
    const [activeMenuItem, setActiveMenuItem] =
        useState<MenuItemType>("dashboard");

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
