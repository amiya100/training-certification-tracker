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
import { apiService } from "./services/api";

export type MenuItemType =
    | "dashboard"
    | "departments"
    | "employees"
    | "trainings"
    | "enrollments"
    | "certifications"
    | "complianceReport";

const MENU_KEY = "activeMenuItem";

const App: React.FC = () => {
    /* ================= AUTH STATE ================= */
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check if token exists and is valid on initial load
        return apiService.isAuthenticated();
    });

    const [authLoading, setAuthLoading] = useState(true);

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

    /* ================= VALIDATE TOKEN ON MOUNT ================= */
    useEffect(() => {
        const validateTokenOnStart = async () => {
            if (apiService.isAuthenticated()) {
                try {
                    const validation = await apiService.validateToken();
                    if (!validation.valid) {
                        // Token is invalid, logout
                        apiService.logout();
                        setIsAuthenticated(false);
                    } else {
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error("Token validation error:", error);
                    apiService.logout();
                    setIsAuthenticated(false);
                }
            }
            setAuthLoading(false);
        };

        validateTokenOnStart();
    }, []);

    /* ================= SAVE MENU ITEM ================= */
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem(MENU_KEY, activeMenuItem);
        }
    }, [activeMenuItem, isAuthenticated]);

    /* ================= LOGIN/LOGOUT EFFECT ================= */
    useEffect(() => {
        // Listen for storage changes (for example, if token is cleared in another tab)
        const checkAuth = () => {
            const isAuth = apiService.isAuthenticated();
            setIsAuthenticated(isAuth);
        };

        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    /* ================= LOGIN HANDLER ================= */
    const handleLogin = () => {
        setIsAuthenticated(true);
        setActiveMenuItem("dashboard");
    };

    /* ================= LOGOUT HANDLER ================= */
    const handleLogout = () => {
        apiService.logout();
        setIsAuthenticated(false);
        setActiveMenuItem("dashboard");
        setViewingCertificateId(null);
    };

    /* ================= TOKEN VALIDATION INTERVAL ================= */
    useEffect(() => {
        if (!isAuthenticated) return;

        const validateTokenPeriodically = async () => {
            try {
                const validation = await apiService.validateToken();
                if (!validation.valid) {
                    handleLogout();
                }
            } catch (error) {
                console.error("Periodic token validation failed:", error);
            }
        };

        // Validate token every 5 minutes
        const interval = setInterval(validateTokenPeriodically, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

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
                return <Dashboard setActiveMenuItem={setActiveMenuItem} />;
        }
    };

    /* ================= LOADING STATE ================= */
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-bg text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Checking authentication...</p>
                </div>
            </div>
        );
    }

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
                    onLogout={handleLogout}
                />
                <main className="flex-1 overflow-auto">{renderContent()}</main>
            </div>
        </div>
    );
};

export default App;
