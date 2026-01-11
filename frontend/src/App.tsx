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
import CertificateView from "./pages/CertificateView"; // Add this import

export type MenuItemType =
    | "dashboard"
    | "departments"
    | "employees"
    | "trainings"
    | "enrollments"
    | "certifications"
    | "complianceReport";

const STORAGE_KEY = "activeMenuItem";

// Add certificateId state to track if we're viewing a certificate
const App: React.FC = () => {
    const [activeMenuItem, setActiveMenuItem] = useState<MenuItemType>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
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
        return "dashboard";
    });

    // Add state for viewing a specific certificate
    const [viewingCertificateId, setViewingCertificateId] = useState<
        number | null
    >(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, activeMenuItem);
    }, [activeMenuItem]);

    // Function to view a certificate (called from Certifications page)
    const handleViewCertificate = (certificateId: number) => {
        setActiveMenuItem("certifications");
        setViewingCertificateId(certificateId);
    };

    // Function to go back to certifications list
    const handleBackToCertifications = () => {
        setViewingCertificateId(null);
    };

    const renderContent = () => {
        // If we're viewing a specific certificate, show CertificateView
        if (viewingCertificateId !== null) {
            return (
                <CertificateView
                    certificateId={viewingCertificateId}
                    onBack={handleBackToCertifications}
                />
            );
        }

        // Otherwise, show the normal menu content
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
                return (
                    <Certifications onViewCertificate={handleViewCertificate} />
                );
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
                onMenuItemClick={(item) => {
                    setActiveMenuItem(item);
                    setViewingCertificateId(null); // Clear certificate view when changing menu
                }}
            />
            <div className="flex-1 flex flex-col">
                <Header
                    activeMenuItem={activeMenuItem}
                    showBackButton={viewingCertificateId !== null}
                    onBack={handleBackToCertifications}
                />
                <main className="flex-1 overflow-auto">{renderContent()}</main>
            </div>
        </div>
    );
};

export default App;
