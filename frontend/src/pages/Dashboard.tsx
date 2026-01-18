// Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import WelcomeSection from "../components/WelcomeSection";
import StatsGrid from "../components/StatsGrid";
import EmployeeStatusCard from "../components/EmployeeStatusCard";
import TrainingProgressCard from "../components/TrainingProgressCard";
import HRMetricsRow from "../components/HRMetricsRow";
import CreateEnrollmentPopup from "../components/Popups/CreateEnrollmentPopup";
import ToastContainer from "../components/ToastContainer";
import CertificationAlert from "../components/CertificationAlert"; // Fixed import name
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import { type DashboardData } from "../types/dashboard";
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import { type EnrollmentFormData } from "../types/enrollment";
import { type Department } from "../types/department";
import type { MenuItemType } from "../App";

interface DashboardProps {
    setActiveMenuItem: (item: MenuItemType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveMenuItem }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateEnrollment, setShowCreateEnrollment] = useState(false);
    const { toasts, addToast, removeToast } = useToast();

    // Add handler functions for certification alerts
    const handleViewAllAlerts = () => {
        console.log("Navigate to certification alerts page");
        setActiveMenuItem && setActiveMenuItem("certifications");
    };

    // Fetch dashboard data from the single processed endpoint
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch processed dashboard data from single endpoint
            const dashboardData = await apiService.getDashboardData();
            const departmentsData = await apiService.getDepartments();
            setData(dashboardData);
            setDepartments(departmentsData);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load dashboard data"
            );
            addToast("Failed to load dashboard data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    // Fetch raw data for popups (only when needed)
    const fetchRawDataForPopup = useCallback(async () => {
        try {
            const [employeesData, trainingsData] = await Promise.all([
                apiService.getEmployees(),
                apiService.getTrainings(),
            ]);

            setEmployees(employeesData);
            setTrainings(trainingsData);
        } catch (err) {
            console.error("Error fetching raw data for popup:", err);
            // Don't show toast as this is background fetch for popup
        }
    }, []);

    // Handle save enrollment with token validation
    const handleSaveEnrollment = useCallback(
        async (enrollmentData: EnrollmentFormData) => {
            try {
                await apiService.createEnrollment(enrollmentData);

                setShowCreateEnrollment(false);
                addToast("Enrollment created successfully!", "success");

                // Refresh dashboard data
                fetchDashboardData();
            } catch (error) {
                console.error("Error creating enrollment:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to create enrollment";
                addToast(errorMessage, "error");
                throw error;
            }
        },
        [addToast, fetchDashboardData]
    );

    // Initial fetch of dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Fetch raw data when popup might be opened
    useEffect(() => {
        if (
            showCreateEnrollment &&
            (employees.length === 0 || trainings.length === 0)
        ) {
            fetchRawDataForPopup();
        }
    }, [
        showCreateEnrollment,
        employees.length,
        trainings.length,
        fetchRawDataForPopup,
    ]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    // Loading state
    if (loading && !data) {
        return <DashboardSkeleton />;
    }

    // Error state - including token validation errors
    if (error || !data) {
        return <ErrorState error={error} onRetry={fetchDashboardData} />;
    }

    return (
        <>
            <div className="p-5 space-y-5">
                <WelcomeSection
                    departments={departments}
                    onRefreshDashboard={fetchDashboardData}
                />

                {/* Stats Grid */}
                <div className="shadow-2xl rounded-3xl">
                    <StatsGrid
                        statsData={data.stats}
                        loading={loading}
                        error={error}
                        onRetry={fetchDashboardData}
                    />
                </div>

                {/* Main Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <DashboardCard>
                        <EmployeeStatusCard
                            data={data.employeeStatus}
                            periodLabel="Current Status"
                            loading={loading}
                            error={error}
                            onRetry={fetchDashboardData}
                        />
                    </DashboardCard>

                    <DashboardCard>
                        <CertificationAlert
                            title="Certification Alerts"
                            alerts={data.certificationAlerts || []}
                            loading={loading}
                            error={error}
                            onViewAll={handleViewAllAlerts}
                            periodLabel="This Month"
                        />
                    </DashboardCard>

                    <DashboardCard>
                        <TrainingProgressCard
                            data={data.trainingProgress}
                            periodLabel="This Month"
                            loading={loading}
                            error={error}
                            onCreateEnrollment={() =>
                                setShowCreateEnrollment(true)
                            }
                            onViewAll={() => setActiveMenuItem("enrollments")}
                            onRetry={fetchDashboardData}
                        />
                    </DashboardCard>
                </div>

                {/* HR Metrics Row */}
                <HRMetricsRow
                    data={data.hrMetrics}
                    loading={loading}
                    error={error}
                    onViewAll={(type: MenuItemType) => setActiveMenuItem(type)}
                    onRetry={fetchDashboardData}
                />
            </div>

            {/* Create Enrollment Popup */}
            <CreateEnrollmentPopup
                isOpen={showCreateEnrollment}
                onClose={() => setShowCreateEnrollment(false)}
                onSave={handleSaveEnrollment}
                employees={employees}
                trainings={trainings}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

// Helper Components
const DashboardSkeleton = () => (
    <div className="p-5 space-y-5">
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl animate-pulse">
            <div className="h-16 bg-gray-700/50 rounded-3xl"></div>
        </div>
        <div className="shadow-2xl rounded-3xl animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="h-40 bg-gray-700/50 rounded-3xl"
                    ></div>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-700/50 rounded-3xl"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-700/50 rounded-3xl"></div>
            ))}
        </div>
    </div>
);

interface ErrorStateProps {
    error: string | null;
    onRetry: () => void;
    isTokenError?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    onRetry,
    isTokenError,
}) => (
    <div className="p-5">
        <WelcomeSection departments={[]} onRefreshDashboard={onRetry} />
        <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
                {isTokenError
                    ? "Authentication Error"
                    : "Failed to Load Dashboard"}
            </h3>
            <p className="text-gray-300 mb-4">{error || "No data available"}</p>
            <div className="flex justify-center gap-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300"
                >
                    Retry
                </button>
                {isTokenError && (
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="px-4 py-2 bg-purple-600 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white hover:bg-purple-700 transition-all duration-300"
                    >
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    </div>
);

interface DashboardCardProps {
    children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ children }) => (
    <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
        {children}
    </div>
);

export default Dashboard;
