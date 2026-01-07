import React from "react";

interface DistributionItem {
    label: string;
    count: number;
    percent: number;
    color: string;
}

interface TopPerformer {
    name: string;
    role: string;
    performance: number;
    avatarUrl?: string;
}

interface EmployeeStatusCardProps {
    data?: {
        totalEmployees: number;
        distribution: DistributionItem[];
        topPerformer: TopPerformer;
    };
    periodLabel?: string;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

const EmployeeStatusCard: React.FC<EmployeeStatusCardProps> = ({
    data = {
        totalEmployees: 0,
        distribution: [
            { label: "In Training", count: 0, percent: 0, color: "#3B82F6" },
            { label: "Certified", count: 0, percent: 0, color: "#10B981" },
            { label: "Available", count: 0, percent: 0, color: "#6B7280" },
            { label: "Completed", count: 0, percent: 0, color: "#8B5CF6" },
        ],
        topPerformer: {
            name: "No top performer yet",
            role: "Assign employees to trainings",
            performance: 0,
        },
    },
    periodLabel = "Current Status",
    loading = false,
    error = null,
    onRetry,
}) => {
    if (loading) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full animate-pulse">
                {/* Loading skeleton */}
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
                    <div className="h-8 w-24 bg-gray-700/50 rounded-lg"></div>
                </div>
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-3">
                        <div className="h-8 w-16 bg-gray-700/50 rounded"></div>
                        <div className="h-4 w-24 bg-gray-700/50 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-700/50 rounded-full mb-6"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-20 bg-gray-700/50 rounded-xl"
                        ></div>
                    ))}
                </div>
                <div className="h-24 bg-gray-700/50 rounded-xl"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Employee Status
                    </h3>
                    <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg">
                        {periodLabel}
                    </div>
                </div>
                <div className="text-center py-8 flex-1 flex flex-col justify-center">
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
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Failed to Load Data
                    </h3>
                    <p className="text-gray-300 mb-4">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300 mx-auto"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    Employee Status
                </h3>
                <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {periodLabel}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {data.totalEmployees}
                    </span>
                    <span className="text-sm text-gray-300">
                        Total Employees
                    </span>
                </div>

                <div className="flex gap-1 h-3 bg-gray-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
                    {data.distribution.map((item, idx) => (
                        <div
                            key={idx}
                            className="h-full rounded-full flex-shrink-0 shadow-inner"
                            style={{
                                width: `${item.percent}%`,
                                backgroundColor: item.color,
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {data.distribution.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div
                            className="w-5 h-5 rounded-full mb-1 shadow-lg border border-white/20"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-sm text-white drop-shadow-lg">
                            {item.count}
                        </span>
                        <span className="text-xs text-gray-300">
                            {item.percent}%
                        </span>
                        <span className="text-xs font-medium text-gray-200">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/20 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-200">
                        Top Certified Employee
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                            {data.topPerformer.performance}%
                        </span>
                        <span className="text-xs text-gray-300">
                            Certification Rate
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-700/30 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-blue-500/30">
                        <span className="text-white font-semibold text-sm drop-shadow-lg">
                            {data.topPerformer.name.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate drop-shadow-lg">
                            {data.topPerformer.name}
                        </p>
                        <p className="text-xs text-gray-300">
                            {data.topPerformer.role}
                        </p>
                    </div>
                    <button className="p-2 bg-gray-700 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        <svg
                            className="w-4 h-4 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeStatusCard;
