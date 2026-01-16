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
import CertificateView from "./pages/CertificateView";

export type MenuItemType =
    | "dashboard"
    | "departments"
    | "employees"
    | "trainings"
    | "enrollments"
    | "certifications"
    | "complianceReport";

const TOKEN_KEY = "token";
const MENU_KEY = "activeMenuItem";

const App: React.FC = () => {
    /* ================= AUTH STATE ================= */
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check for token on initial load
        const token = localStorage.getItem(TOKEN_KEY);
        return !!token;
    });

    /* ================= MENU STATE ================= */
    const [activeMenuItem, setActiveMenuItem] = useState<MenuItemType>(() => {
        // Try to get saved menu item from localStorage
        const saved = localStorage.getItem(MENU_KEY);
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

    /* ================= CERTIFICATE VIEW STATE ================= */
    const [viewingCertificateId, setViewingCertificateId] = useState<
        number | null
    >(null);

    /* ================= SAVE MENU ITEM ================= */
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem(MENU_KEY, activeMenuItem);
        }
    }, [activeMenuItem, isAuthenticated]);

    /* ================= LOGIN/LOGOUT EFFECT ================= */
    useEffect(() => {
        // Check authentication status on mount and when token changes
        const checkAuth = () => {
            const token = localStorage.getItem(TOKEN_KEY);
            setIsAuthenticated(!!token);
        };

        // Listen for storage changes (for example, if token is cleared in another tab)
        window.addEventListener("storage", checkAuth);

        // Initial check
        checkAuth();

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    /* ================= LOGIN HANDLER ================= */
    const handleLogin = () => {
        // This should be called from Login component after successful login
        // For now, just set authenticated to true
        setIsAuthenticated(true);
    };

    /* ================= LOGOUT HANDLER ================= */
    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(MENU_KEY);
        setIsAuthenticated(false);
        setActiveMenuItem("dashboard");
    };

    /* ================= CERTIFICATE HANDLERS ================= */
    const handleViewCertificate = (certificateId: number) => {
        setActiveMenuItem("certifications");
        setViewingCertificateId(certificateId);
    };

    const handleBackToCertifications = () => {
        setViewingCertificateId(null);
    };

    /* ================= CONTENT RENDER ================= */
    const renderContent = () => {
        if (viewingCertificateId !== null) {
            return (
                <CertificateView
                    certificateId={viewingCertificateId}
                    onBack={handleBackToCertifications}
                />
            );
        }

        switch (activeMenuItem) {
            case "dashboard":
                return <Dashboard setActiveMenuItem={setActiveMenuItem} />;
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

    /* ================= LOGIN ================= */
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    /* ================= MAIN APP ================= */
    return (
        <div className="flex h-screen bg-dark-bg text-white">
            <Sidebar
                activeMenuItem={activeMenuItem}
                onMenuItemClick={(item) => {
                    setActiveMenuItem(item);
                    setViewingCertificateId(null);
                }}
            />
            <div className="flex-1 flex flex-col">
                <Header
                    activeMenuItem={activeMenuItem}
                    showBackButton={viewingCertificateId !== null}
                    onBack={handleBackToCertifications}
                    onLogout={handleLogout} // Optionally pass to Header too
                />
                <main className="flex-1 overflow-auto">{renderContent()}</main>
            </div>
        </div>
    );
};

export default App;
