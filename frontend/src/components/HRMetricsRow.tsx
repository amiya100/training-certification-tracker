// HRMetricsRow.tsx
import React from "react";
import { type HRItem } from "../types/employee";
import { type HRMetricsData } from "../types/hr";

interface HRMetricsRowProps {
    data?: HRMetricsData;
    loading?: boolean;
    error?: string | null;
    onViewAll?: (type: string) => void;
    onRetry?: () => void;
}

const HRMetricsRow: React.FC<HRMetricsRowProps> = ({
    data = {
        employees: [],
        trainings: [],
        departments: [],
    },
    loading = false,
    error = null,
    onViewAll,
    onRetry,
}) => {
    const handleViewAll = (type: string) => {
        if (onViewAll) {
            onViewAll(type);
        } else {
            console.log(`View all ${type}`);
            // Default navigation or custom handling
        }
    };

    const renderCard = (
        title: string,
        items: HRItem[],
        type: string,
        emptyMessage: string = "No data available"
    ) => {
        if (loading) {
            return (
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col animate-pulse">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
                        <div className="h-8 w-16 bg-gray-700/50 rounded-lg"></div>
                    </div>
                    <div className="space-y-3 flex-1">
                        {[...Array(4)].map((_, idx) => (
                            <div
                                key={idx}
                                className="h-16 bg-gray-700/50 rounded-xl"
                            ></div>
                        ))}
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                            {title}
                        </h3>
                        <button
                            disabled
                            className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg"
                        >
                            View All
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-red-400"
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
                        <p className="text-gray-300 mb-4">
                            Failed to load data
                        </p>
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
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        {title}
                    </h3>
                    <button
                        onClick={() => handleViewAll(type)}
                        className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        View All
                    </button>
                </div>
                <div className="space-y-3 flex-1">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {item.avatarUrl ? (
                                    <img
                                        src={item.avatarUrl}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-full ring-2 ring-white/30 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-600/50 rounded-full ring-2 ring-white/30 shadow-lg flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                            {item.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-white truncate drop-shadow-lg">
                                        {item.name}
                                    </p>
                                    {/* Only show subtitle for employees and trainings, not for departments */}
                                    {type !== "departments" && item.role && (
                                        <p className="text-xs text-gray-300 truncate">
                                            {item.role}
                                        </p>
                                    )}
                                </div>
                                {/* Only show status if it exists (for employees and departments, not for trainings) */}
                                {item.status && type !== "trainings" && (
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium truncate max-w-[120px] ${item.statusColor}`}
                                    >
                                        {item.status}
                                    </div>
                                )}
                                {/* Show training count for trainings */}
                                {type === "trainings" &&
                                    item.trainingCount !== undefined && (
                                        <div className="px-2 py-1 rounded-full text-xs font-medium truncate max-w-[120px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                            {item.trainingCount} enrollments
                                        </div>
                                    )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 text-sm">
                                {emptyMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employees Card */}
            {renderCard(
                "Employees",
                data.employees,
                "employees",
                "No employees found"
            )}

            {/* Trainings Card */}
            {renderCard(
                "Training Programs",
                data.trainings,
                "trainings",
                "No training programs found"
            )}

            {/* Departments Card */}
            {renderCard(
                "Departments",
                data.departments,
                "departments",
                "No departments found"
            )}
        </div>
    );
};

export default HRMetricsRow;
