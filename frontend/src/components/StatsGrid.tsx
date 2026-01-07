import React from "react";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    isPositive,
    icon,
    bgColor,
}) => {
    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] group">
            <div className="flex items-start justify-between mb-6">
                <div
                    className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                >
                    {icon}
                </div>
                <div className="flex items-center space-x-1">
                    <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                            isPositive
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-orange-500/20 text-orange-300 border-orange-500/40"
                        } backdrop-blur-sm`}
                    >
                        <span className="flex items-center">
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="mr-1"
                            >
                                {isPositive ? (
                                    <polyline points="18,15 12,9 6,15" />
                                ) : (
                                    <polyline points="6,9 12,15 18,9" />
                                )}
                            </svg>
                            {change}
                        </span>
                    </span>
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {value}
                    </span>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:-translate-y-0.5 transition-all duration-300">
                    View Details →
                </button>
            </div>
        </div>
    );
};

interface DashboardStats {
    // employees / departments
    total_employees: number;
    total_departments: number;
    employee_growth_percentage: number;

    // trainings (training programs)
    total_trainings: number;
    training_growth_percentage: number;

    // enrollments (employee assignments to trainings)
    active_enrollments: number;
    enrollment_growth_percentage: number;

    // certifications
    total_certifications: number;
    expiring_certifications: number;
    expiring_change_percentage: number;
    certification_growth_percentage: number;

    // completion rate
    completion_rate: number;
    completion_change_percentage: number;

    // training hours
    total_training_hours: number;
    training_hours_growth_percentage: number;
}

interface StatsGridProps {
    statsData?: DashboardStats;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

const StatsGrid: React.FC<StatsGridProps> = ({
    statsData,
    loading = false,
    error = null,
    onRetry,
}) => {
    // Transform stats data to StatCardProps format
    const transformStatsToCards = (data: DashboardStats): StatCardProps[] => {
        if (!data) return getDefaultStats();

        return [
            {
                title: "Total Employees",
                value: data.total_employees.toLocaleString(),
                change: `${
                    data.employee_growth_percentage >= 0 ? "+" : ""
                }${data.employee_growth_percentage.toFixed(1)}%`,
                isPositive: data.employee_growth_percentage >= 0,
                bgColor: "bg-blue-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                ),
            },
            {
                title: "Training Programs",
                value: data.total_trainings.toLocaleString(),
                change: `${
                    data.training_growth_percentage >= 0 ? "+" : ""
                }${data.training_growth_percentage.toFixed(1)}%`,
                isPositive: data.training_growth_percentage >= 0,
                bgColor: "bg-emerald-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        <path d="M2 2l7.586 7.586" />
                        <circle cx="11" cy="11" r="2" />
                    </svg>
                ),
            },
            {
                title: "Active Enrollments",
                value: data.active_enrollments.toLocaleString(),
                change: `${
                    data.enrollment_growth_percentage >= 0 ? "+" : ""
                }${data.enrollment_growth_percentage.toFixed(1)}%`,
                isPositive: data.enrollment_growth_percentage >= 0,
                bgColor: "bg-cyan-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                        <path d="M20 8v6" />
                        <path d="M23 11h-6" />
                    </svg>
                ),
            },
            {
                title: "Certifications Issued",
                value: data.total_certifications.toLocaleString(),
                change: `${
                    data.certification_growth_percentage >= 0 ? "+" : ""
                }${data.certification_growth_percentage.toFixed(1)}%`,
                isPositive: data.certification_growth_percentage >= 0,
                bgColor: "bg-purple-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M12 15l8-5-8-5-8 5 8 5z" />
                        <path d="M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8" />
                        <path d="M9 19l-2 2" />
                        <path d="M15 19l2 2" />
                    </svg>
                ),
            },
            {
                title: "Departments",
                value: data.total_departments.toLocaleString(),
                change: "+0.0%", // Usually departments don't change frequently
                isPositive: true,
                bgColor: "bg-indigo-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                        />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                ),
            },
            {
                title: "Expiring Certifications",
                value: data.expiring_certifications.toLocaleString(),
                change: `${
                    data.expiring_change_percentage >= 0 ? "+" : ""
                }${data.expiring_change_percentage.toFixed(1)}%`,
                // Negative change is good (fewer expiring certs)
                isPositive: data.expiring_change_percentage < 0,
                bgColor: "bg-orange-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                        <path d="M7.5 7.5l9 9" />
                        <path d="M16.5 7.5l-9 9" />
                    </svg>
                ),
            },
            {
                title: "Completion Rate",
                value: `${data.completion_rate.toFixed(1)}%`,
                change: `${
                    data.completion_change_percentage >= 0 ? "+" : ""
                }${data.completion_change_percentage.toFixed(1)}%`,
                isPositive: data.completion_change_percentage >= 0,
                bgColor: "bg-green-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                ),
            },
            {
                title: "Training Hours",
                value: data.total_training_hours.toLocaleString(),
                change: `${
                    data.training_hours_growth_percentage >= 0 ? "+" : ""
                }${data.training_hours_growth_percentage.toFixed(1)}%`,
                isPositive: data.training_hours_growth_percentage >= 0,
                bgColor: "bg-pink-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                ),
            },
        ];
    };

    // Get default fallback stats
    const getDefaultStats = (): StatCardProps[] => {
        return [
            {
                title: "Total Employees",
                value: "0",
                change: "+0.0%",
                isPositive: true,
                bgColor: "bg-blue-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                ),
            },
            {
                title: "Training Programs",
                value: "0",
                change: "+0.0%",
                isPositive: true,
                bgColor: "bg-emerald-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        <path d="M2 2l7.586 7.586" />
                        <circle cx="11" cy="11" r="2" />
                    </svg>
                ),
            },
            {
                title: "Active Enrollments",
                value: "0",
                change: "+0.0%",
                isPositive: true,
                bgColor: "bg-cyan-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                        <path d="M20 8v6" />
                        <path d="M23 11h-6" />
                    </svg>
                ),
            },
            {
                title: "Certifications Issued",
                value: "0",
                change: "+0.0%",
                isPositive: true,
                bgColor: "bg-purple-500",
                icon: (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                    >
                        <path d="M12 15l8-5-8-5-8 5 8 5z" />
                        <path d="M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8" />
                        <path d="M9 19l-2 2" />
                        <path d="M15 19l2 2" />
                    </svg>
                ),
            },
        ];
    };

    const stats = statsData
        ? transformStatsToCards(statsData)
        : getDefaultStats();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-gray-700/50 rounded-2xl"></div>
                            <div className="w-16 h-6 bg-gray-700/50 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-700/50 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="text-center py-8">
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
                        Failed to Load Stats
                    </h3>
                    <p className="text-gray-300 mb-4">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default StatsGrid;
