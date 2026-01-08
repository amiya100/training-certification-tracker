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

// Static data for demonstration - updated to match component interfaces
const staticDashboardData: EmployeeDashboardData = {
    employeeName: "John Smith",
    status: {
        totalTrainings: 15,
        completed: 8,
        inProgress: 4,
        certified: 6,
    },
    trainings: [
        {
            id: "1",
            trainingName: "Workplace Safety",
            progress: 100,
            status: "completed",
            endDate: "2023-10-15",
            hasCertification: true,
        },
        {
            id: "2",
            trainingName: "Cybersecurity Fundamentals",
            progress: 65,
            status: "in_progress",
            endDate: "2023-11-30",
            hasCertification: true,
        },
        {
            id: "3",
            trainingName: "Project Management",
            progress: 100,
            status: "completed",
            endDate: "2023-09-20",
            hasCertification: true,
        },
        {
            id: "4",
            trainingName: "Data Privacy",
            progress: 30,
            status: "in_progress",
            endDate: "2023-12-10",
        },
    ],
    certifications: {
        active: 6,
        expired: 2,
        expiringSoon: 1,
    },
};

const EmployeeDashboard: React.FC = () => {
    const [data, setData] = useState<EmployeeDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const safePercent = (value: number, total: number) =>
        total === 0 ? 0 : (value / total) * 100;

    const fetchEmployeeDashboard = async () => {
        setLoading(true);
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Use static data instead of API call
            setData(staticDashboardData);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeDashboard();
    }, []);

    if (loading) {
        return (
            <div className="p-6 text-gray-300 flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-red-500">
                Failed to load dashboard data. Please try again later.
            </div>
        );
    }

    // Transform trainings data to match TrainingProgressCard interface
    const transformTrainingsToParticipants = () => {
        return data.trainings.map((training) => ({
            id: training.id,
            name: data.employeeName, // Using employee name since it's employee dashboard
            role: "Employee",
            avatarUrl: undefined,
            trainingName: training.trainingName,
            progress: training.progress,
            status: training.status,
            endDate: training.endDate,
            deadline: training.endDate, // Using endDate as deadline
            hasCertification: training.hasCertification,
        }));
    };

    // Calculate upcoming deadlines count
    const calculateUpcomingDeadlines = () => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        return data.trainings.filter((training) => {
            if (!training.endDate) return false;
            const endDate = new Date(training.endDate);
            return endDate > today && endDate <= nextWeek;
        }).length;
    };

    return (
        <div className="p-5 space-y-5">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Employee Dashboard
            </h1>

            {/* Welcome Section */}
            <WelcomeSection
                title={`Welcome, ${data.employeeName}`}
                subtitle="Here's an overview of your training progress and certifications"
            />

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
                            role: "Employee",
                            performance: safePercent(
                                data.status.completed,
                                data.status.totalTrainings
                            ),
                        },
                    }}
                    periodLabel="My Training Status"
                />

                <TrainingProgressCard
                    data={transformTrainingsToParticipants()}
                    periodLabel="My Trainings"
                    onCreateEnrollment={() =>
                        console.log("Create enrollment clicked")
                    }
                    onViewAll={() => console.log("View all clicked")}
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
                                label: "In Progress",
                                count: data.status.inProgress,
                                percent: safePercent(
                                    data.status.inProgress,
                                    data.status.totalTrainings
                                ),
                                color: "#3B82F6",
                            },
                            {
                                label: "Not Started",
                                count: Math.max(
                                    0,
                                    data.status.totalTrainings -
                                        data.status.completed -
                                        data.status.inProgress
                                ),
                                percent: safePercent(
                                    Math.max(
                                        0,
                                        data.status.totalTrainings -
                                            data.status.completed -
                                            data.status.inProgress
                                    ),
                                    data.status.totalTrainings
                                ),
                                color: "#6B7280",
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
                        expiringAvatars: [
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=Safety",
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=Compliance",
                        ],
                        upcomingDeadlines: calculateUpcomingDeadlines(),
                    }}
                    onViewDetails={() => console.log("View details clicked")}
                />
            </div>

            {/* Optional: Button to refresh data */}
            <div className="flex justify-end">
                <button
                    onClick={fetchEmployeeDashboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
