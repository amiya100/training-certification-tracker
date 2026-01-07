// EmployeeDashboard.tsx
import React, { useEffect, useState } from "react";
import WelcomeSection from "../components/WelcomeSection";
import EmployeeStatusCard from "../components/EmployeeStatusCard";
import TrainingProgressCard from "../components/TrainingProgressCard";
import TrainingCertificationCard from "../components/TrainingCertificationCard";

// Dashboard Data Interface
interface EmployeeDashboardData {
    employeeName: string;
    status: {
        totalTrainings: number;
        completed: number;
        inProgress: number;
        certified: number;
    };
    trainings: Array<{
        id: string;
        trainingName: string;
        progress: number;
        status: "enrolled" | "in_progress" | "completed" | "overdue";
        endDate?: string;
        hasCertification?: boolean;
    }>;
    certifications: {
        active: number;
        expired: number;
        expiringSoon: number;
    };
}

const EmployeeDashboard: React.FC = () => {
    const [data, setData] = useState<EmployeeDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const employeeId = localStorage.getItem("employee_id") || "1";

    const safePercent = (value: number, total: number) =>
        total === 0 ? 0 : (value / total) * 100;

    const fetchEmployeeDashboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8000/api/employee-dashboard/${employeeId}`
            );
            if (!res.ok) {
                throw new Error(`API returned status ${res.status}`);
            }
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeDashboard();
    }, []);

    if (loading) {
        return <div className="p-6 text-gray-300">Loading dashboard...</div>;


    }

    if (!data) {
        return (
            <div className="p-6 text-red-500">
                Failed to load dashboard data. Please check your API.
            </div>
        );
    }

    return (
        <div className="p-5 space-y-5">
            <h1 className="text-2xl font-bold">Employee Dashboard</h1>

            {/* Welcome Section */}
            <WelcomeSection title={`Welcome, ${data.employeeName}`} />

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <EmployeeStatusCard
                    data={{
                        totalEmployees: data.status.totalTrainings,
                        distribution: [
                            {
                                label: "Completed",
                                count: data.status.completed,
                                percent: safePercent(
                                    data.status.completed,
                                    data.status.totalTrainings
                                ),
                                color: "#10B981",
                            },
                            {
                                label: "In Progress",
                                count: data.status.inProgress,
                                percent: safePercent(
                                    data.status.inProgress,
                                    data.status.totalTrainings
                                ),
                                color: "#3B82F6",
                            },
                            {
                                label: "Certified",
                                count: data.status.certified,
                                percent: safePercent(
                                    data.status.certified,
                                    data.status.totalTrainings
                                ),
                                color: "#8B5CF6",
                            },
                        ],
                        topPerformer: {
                            name: data.employeeName,
                            role: "You",
                            performance: safePercent(
                                data.status.completed,
                                data.status.totalTrainings
                            ),
                        },
                    }}
                    periodLabel="My Training Status"
                />

                <TrainingProgressCard
                    data={data.trainings}
                    periodLabel="My Trainings"
                />

                <TrainingCertificationCard
                    data={{
                        totalTrainings: data.status.totalTrainings,
                        certificationStatuses: [
                            {
                                label: "Active",
                                count: data.certifications.active,
                                percent: safePercent(
                                    data.certifications.active,
                                    data.status.totalTrainings
                                ),
                                color: "#10B981",
                            },
                            {
                                label: "Expired",
                                count: data.certifications.expired,
                                percent: safePercent(
                                    data.certifications.expired,
                                    data.status.totalTrainings
                                ),
                                color: "#EF4444",
                            },
                        ],
                        expiringSoonCount: data.certifications.expiringSoon,
                        expiringAvatars: [],
                        upcomingDeadlines: 0,
                    }}
                />
            </div>
        </div>
    );
};

export default EmployeeDashboard;
