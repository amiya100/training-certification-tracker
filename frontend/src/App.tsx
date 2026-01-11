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

const STORAGE_KEY = "activeMenuItem";

const App: React.FC = () => {
  /* ================= AUTH STATE ================= */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ================= MENU STATE ================= */
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

  /* ================= CERTIFICATE VIEW STATE ================= */
  const [viewingCertificateId, setViewingCertificateId] = useState<number | null>(
    null
  );

  /* ================= SAVE MENU ================= */
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, activeMenuItem);
    }
  }, [activeMenuItem, isAuthenticated]);

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

  /* ================= LOGIN ================= */
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
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
        />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
