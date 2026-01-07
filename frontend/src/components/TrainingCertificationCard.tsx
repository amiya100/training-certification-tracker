import React from "react";

interface CertificationStatus {
    label: string;
    percent: number;
    color: string;
    count: number;
}

interface TrainingCertificationCardProps {
    data?: {
        totalTrainings: number;
        certificationStatuses: CertificationStatus[];
        expiringSoonCount: number;
        expiringAvatars: string[];
        upcomingDeadlines: number;
    };
    periodLabel?: string;
    loading?: boolean;
    error?: string | null;
    onViewDetails?: () => void;
    onRetry?: () => void;
}

const TrainingCertificationCard: React.FC<TrainingCertificationCardProps> = ({
    data = {
        totalTrainings: 0,
        certificationStatuses: [
            { label: "Certified", percent: 0, color: "#10B981", count: 0 },
            { label: "In Progress", percent: 0, color: "#3B82F6", count: 0 },
            { label: "Not Started", percent: 0, color: "#6B7280", count: 0 },
            { label: "Expired", percent: 0, color: "#EF4444", count: 0 },
        ],
        expiringSoonCount: 0,
        expiringAvatars: [],
        upcomingDeadlines: 0,
    },
    periodLabel = "This Month",
    loading = false,
    error = null,
    onViewDetails,
    onRetry,
}) => {
    // Calculate total percentage for the gauge
    const totalPercent = data.certificationStatuses.reduce(
        (sum, status) => sum + status.percent,
        0
    );

    // Generate conic gradient for certification status
    const conicStops = data.certificationStatuses
        .map((status, idx) => {
            const start =
                idx === 0
                    ? 0
                    : data.certificationStatuses
                          .slice(0, idx)
                          .reduce((sum, s) => sum + s.percent, 0);
            const end = start + status.percent;
            return `${status.color} ${start}% ${end}%`;
        })
        .join(", ");

    const handleViewDetailsClick = () => {
        if (onViewDetails) {
            onViewDetails();
        } else {
            console.log("Navigating to training details page...");
            // Default navigation
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-gray-700/50 rounded"></div>
                    <div className="h-8 w-20 bg-gray-700/50 rounded-lg"></div>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 mb-4">
                        <div className="absolute inset-0 w-full h-full rounded-full border-8 border-white/20"></div>
                        <div className="absolute inset-4 bg-gray-700/50 rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {[...Array(4)].map((_, idx) => (
                        <div
                            key={idx}
                            className="h-12 bg-gray-700/50 rounded-xl"
                        ></div>
                    ))}
                </div>

                <div className="border-t border-white/20 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-4 w-24 bg-gray-700/50 rounded"></div>
                        <div className="h-6 w-12 bg-gray-700/50 rounded"></div>
                    </div>
                    <div className="flex -space-x-2 mb-4">
                        {[...Array(4)].map((_, idx) => (
                            <div
                                key={idx}
                                className="w-8 h-8 bg-gray-700/50 rounded-full"
                            ></div>
                        ))}
                    </div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Training & Certifications
                    </h3>
                    <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg">
                        {periodLabel}
                    </div>
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
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Failed to Load Data
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
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    Training & Certifications
                </h3>
                <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {periodLabel}
                </div>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-4">
                    {/* Semi-circle gauge background */}
                    <div className="absolute inset-0 w-full h-full rounded-full border-8 border-white/20"></div>
                    {/* Gauge segments - dynamic conic gradient */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(${conicStops})`,
                        }}
                    ></div>
                    {/* Center circle */}
                    <div className="absolute inset-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex flex-col items-center justify-center shadow-2xl border-2 border-white/20">
                        <span className="text-2xl font-bold text-white drop-shadow-lg">
                            {data.totalTrainings}
                        </span>
                        <span className="text-xs text-gray-300">
                            Total Trainings
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {data.certificationStatuses.map((status, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full shadow-lg border border-white/20"
                                style={{
                                    backgroundColor: status.color,
                                    boxShadow: `0 0 8px ${status.color}40`,
                                }}
                            ></div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-white drop-shadow-lg">
                                    {status.label}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {status.count}{" "}
                                    {status.count === 1
                                        ? "employee"
                                        : "employees"}
                                </span>
                            </div>
                        </div>
                        <span className="font-semibold text-sm text-white drop-shadow-lg">
                            {status.percent}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/20 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-200">
                        Expiring Soon
                    </span>
                    <span className="text-lg font-bold text-red-400 drop-shadow-lg">
                        {data.expiringSoonCount}
                    </span>
                </div>
                <div className="flex -space-x-2 mb-4">
                    {Array.from({
                        length: Math.min(data.expiringAvatars.length, 4),
                    }).map((_, idx) => (
                        <img
                            key={idx}
                            src={data.expiringAvatars[idx]}
                            alt="Employee"
                            className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg ring-2 ring-red-500/50"
                        />
                    ))}
                    {data.expiringSoonCount > 4 && (
                        <div className="w-8 h-8 bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-gray-300 border-2 border-white/30 shadow-lg ring-2 ring-red-500/50">
                            +{data.expiringSoonCount - 4}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleViewDetailsClick}
                    className="w-full py-3 px-4 bg-gray-700 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-gray-600"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default TrainingCertificationCard;
