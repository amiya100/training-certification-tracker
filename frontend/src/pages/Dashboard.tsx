// Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import WelcomeSection from "../components/WelcomeSection";
import StatsGrid from "../components/StatsGrid";
import EmployeeStatusCard from "../components/EmployeeStatusCard";
import TrainingCertificationCard from "../components/TrainingCertificationCard";
import TrainingProgressCard from "../components/TrainingProgressCard";
import HRMetricsRow from "../components/HRMetricsRow";
import CreateEnrollmentPopup from "../components/Popups/CreateEnrollmentPopup";
import ToastContainer from "../components/ToastContainer";
import { apiService } from "../services/api";
import { DashboardProcessor } from "../utils/dashboardProcessor";
import { useToast } from "../hooks/useToast";
import { type DashboardData } from "../types/dashboard";
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import { type EnrollmentFormData } from "../types/enrollment";
import { type Department } from "../types/department";

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateEnrollment, setShowCreateEnrollment] = useState(false);
    const { toasts, addToast, removeToast } = useToast();

    // Memoized fetch function
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                statsData,
                employeesData,
                trainingsData,
                enrollmentsData,
                certificationsData,
                departmentsData,
            ] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getEmployees(),
                apiService.getTrainings(),
                apiService.getEnrollments(),
                apiService.getCertifications(),
                apiService.getDepartments(),
            ]);

            // Store raw data
            setEmployees(employeesData);
            setTrainings(trainingsData);
            setDepartments(departmentsData);

            // Process data
            const processor = new DashboardProcessor(
                employeesData,
                trainingsData,
                enrollmentsData,
                certificationsData,
                departmentsData
            );

            const processedData = processor.processAll(statsData);
            setData(processedData);
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

    // Handle save enrollment
    const handleSaveEnrollment = useCallback(
        async (enrollmentData: EnrollmentFormData) => {
            try {
                await apiService.createEnrollment(enrollmentData);

                setShowCreateEnrollment(false);
                addToast("Enrollment created successfully!", "success");

                // Refresh only necessary data
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

    // Initial fetch
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    // Loading state
    if (loading && !data) {
        return <DashboardSkeleton />;
    }

    // Error state
    if (error || !data) {
        return (
            <ErrorState
                error={error}
                onRetry={fetchDashboardData}
                departments={departments}
            />
        );
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
                        <TrainingCertificationCard
                            data={data.trainingCertifications}
                            periodLabel="This Month"
                            loading={loading}
                            error={error}
                            onViewDetails={() =>
                                console.log("Navigate to training details")
                            }
                            onRetry={fetchDashboardData}
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
                            onViewAll={() =>
                                console.log("Navigate to enrollments page")
                            }
                            onRetry={fetchDashboardData}
                        />
                    </DashboardCard>
                </div>

                {/* HR Metrics Row */}
                <HRMetricsRow
                    data={data.hrMetrics}
                    loading={loading}
                    error={error}
                    onViewAll={(type: string) =>
                        console.log(`View all ${type}`)
                    }
                    onRetry={fetchDashboardData}
                />
            </div>

            {/* Create Enrollment Popup */}
            <CreateEnrollmentPopup
                isOpen={showCreateEnrollment}
                onClose={() => setShowCreateEnrollment(false)}
                onSave={handleSaveEnrollment}
                employees={employees.map((emp) => ({
                    id: emp.id,
                    name: `${emp.first_name} ${emp.last_name}`,
                    position: emp.position,
                    department: departments.find(
                        (d) => d.id === emp.department_id
                    )?.name,
                }))}
                trainings={trainings.map((train) => ({
                    id: train.id,
                    name: train.name,
                    description: train.description,
                    duration_hours: train.duration_hours || 0,
                }))}
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
    departments: Department[];
}

const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    onRetry,
    departments,
}) => (
    <div className="p-5">
        <WelcomeSection
            departments={departments}
            onRefreshDashboard={onRetry}
        />
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
                Failed to Load Dashboard
            </h3>
            <p className="text-gray-300 mb-4">{error || "No data available"}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300"
            >
                Retry
            </button>
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
