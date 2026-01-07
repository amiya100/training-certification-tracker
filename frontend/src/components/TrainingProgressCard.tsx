import React, { useState } from "react";

interface TrainingParticipant {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    trainingName: string;
    progress?: number; // Percentage
    status: "enrolled" | "in_progress" | "completed" | "cancelled" | "overdue";
    startDate?: string;
    endDate?: string;
    deadline?: string;
    completionDate?: string;
    hasCertification?: boolean;
}

interface TrainingProgressCardProps {
    data?: TrainingParticipant[];
    periodLabel?: string;
    loading?: boolean;
    error?: string | null;
    onCreateEnrollment?: () => void;
    onViewAll?: () => void;
    onRetry?: () => void;
}

const TrainingProgressCard: React.FC<TrainingProgressCardProps> = ({
    data = [],
    periodLabel = "This Month",
    loading = false,
    error = null,
    onCreateEnrollment,
    onViewAll,
    onRetry,
}) => {
    const [expandedParticipant, setExpandedParticipant] = useState<
        string | null
    >(null);

    // Get status color - updated to match backend statuses
    const getStatusColor = (status: string, hasCertification?: boolean) => {
        if (hasCertification) {
            return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
        }

        switch (status) {
            case "completed":
                return "bg-green-500/20 text-green-300 border border-green-500/40";
            case "in_progress":
                return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
            case "overdue":
                return "bg-red-500/20 text-red-300 border border-red-500/40";
            case "cancelled":
                return "bg-gray-500/20 text-gray-300 border border-gray-500/40";
            default: // enrolled
                return "bg-purple-500/20 text-purple-300 border border-purple-500/40";
        }
    };

    // Get status display text - updated to match backend statuses
    const getStatusText = (
        status: string,
        progress?: number,
        hasCertification?: boolean
    ) => {
        if (hasCertification) {
            return "Certified";
        }

        switch (status) {
            case "completed":
                return "Completed";
            case "in_progress":
                return progress ? `${progress}%` : "In Progress";
            case "overdue":
                return "Overdue";
            case "cancelled":
                return "Cancelled";
            default: // enrolled
                return "Enrolled";
        }
    };

    const handleCreateEnrollment = () => {
        if (onCreateEnrollment) {
            onCreateEnrollment();
        } else {
            console.log("Navigate to create enrollment");
            // Default navigation
        }
    };

    const handleViewAll = () => {
        if (onViewAll) {
            onViewAll();
        } else {
            console.log("Navigate to enrollments page");
            // Default navigation
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
                    <div className="h-8 w-16 bg-gray-700/50 rounded-lg"></div>
                </div>
                <div className="flex-1 space-y-4">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="h-16 bg-gray-700/50 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Training Progress
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

    // No enrollments state
    if (data.length === 0) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Training Progress
                    </h3>
                    <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        {periodLabel}
                    </div>
                </div>

                {/* No enrollments message */}
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-20 h-20 bg-gray-700/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-2 border-white/20">
                        <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        No Training Enrollments Yet
                    </h4>
                    <p className="text-gray-400 mb-6 max-w-sm">
                        There are no employees enrolled in any training programs
                        yet. Start by assigning employees to training programs.
                    </p>
                    <button
                        onClick={handleCreateEnrollment}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-sm text-white font-semibold rounded-xl border border-blue-500/30 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
                    >
                        Create First Enrollment
                    </button>
                </div>
            </div>
        );
    }

    // Normal state with enrollments
    const overdueParticipants = data.filter((p) => p.status === "overdue");

    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    Training Progress
                </h3>
                <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {periodLabel}
                </div>
            </div>

            <div className="flex-1 space-y-4">
                {/* Training Participants */}
                {data.slice(0, 8).map((participant) => (
                    <div key={participant.id} className="space-y-3">
                        {/* Main participant row */}
                        <div
                            className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm border border-white/20 rounded-xl cursor-pointer transition-all duration-300 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 group"
                            onClick={() =>
                                setExpandedParticipant(
                                    expandedParticipant === participant.id
                                        ? null
                                        : participant.id
                                )
                            }
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                                        {participant.avatarUrl ? (
                                            <img
                                                src={participant.avatarUrl}
                                                alt={participant.name}
                                                className="w-full h-full rounded-full"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold text-sm drop-shadow-lg">
                                                {participant.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    {participant.status === "overdue" && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full shadow-lg ring-2 ring-red-500/50"></div>
                                    )}
                                    {participant.hasCertification && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-lg ring-2 ring-emerald-500/50 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">
                                                ✓
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm text-white truncate drop-shadow-lg">
                                        {participant.name}
                                    </p>
                                    <p className="text-xs text-gray-300">
                                        {participant.role}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {participant.trainingName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm ${getStatusColor(
                                        participant.status,
                                        participant.hasCertification
                                    )}`}
                                >
                                    {getStatusText(
                                        participant.status,
                                        participant.progress,
                                        participant.hasCertification
                                    )}
                                </div>
                                {(participant.status === "in_progress" ||
                                    participant.status === "overdue") &&
                                    participant.progress !== undefined && (
                                        <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    participant.status ===
                                                    "overdue"
                                                        ? "bg-gradient-to-r from-red-500 to-pink-500"
                                                        : "bg-gradient-to-r from-blue-500 to-cyan-400"
                                                }`}
                                                style={{
                                                    width: `${participant.progress}%`,
                                                }}
                                            ></div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Expanded details */}
                        {expandedParticipant === participant.id && (
                            <div className="space-y-2 pb-2 bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-md"></div>
                                    <span className="text-gray-200 font-medium">
                                        Start Date
                                    </span>
                                    <span className="ml-auto text-gray-300 font-mono">
                                        {participant.startDate || "Not started"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full shadow-md"></div>
                                    <span className="text-gray-200 font-medium">
                                        Deadline
                                    </span>
                                    <span className="ml-auto text-gray-300 font-mono">
                                        {participant.deadline || "No deadline"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-md"></div>
                                    <span className="text-gray-200 font-medium">
                                        Status
                                    </span>
                                    <span className="ml-auto text-gray-300 font-mono">
                                        {participant.hasCertification
                                            ? "Certified"
                                            : participant.status ===
                                              "in_progress"
                                            ? `${participant.progress}% Complete`
                                            : participant.status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              participant.status.slice(1)}
                                    </span>
                                </div>
                                {participant.completionDate && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="w-2 h-2 bg-green-400 rounded-full shadow-md"></div>
                                        <span className="text-gray-200 font-medium">
                                            Completed
                                        </span>
                                        <span className="ml-auto text-gray-300 font-mono">
                                            {participant.completionDate}
                                        </span>
                                    </div>
                                )}
                                {participant.hasCertification && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-md"></div>
                                        <span className="text-gray-200 font-medium">
                                            Certification
                                        </span>
                                        <span className="ml-auto text-gray-300 font-mono">
                                            Active
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Overdue Trainings Section */}
            {overdueParticipants.length > 0 && (
                <div className="mt-6">
                    <div className="border-t border-white/20 pt-6">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            Overdue Trainings
                            <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg"></div>
                        </h4>
                        <div className="space-y-3">
                            {overdueParticipants
                                .slice(0, 2) // Limit to 2 overdue items
                                .map((overdue) => (
                                    <div
                                        key={overdue.id}
                                        className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-red-500/30">
                                                {overdue.avatarUrl ? (
                                                    <img
                                                        src={overdue.avatarUrl}
                                                        alt={overdue.name}
                                                        className="w-full h-full rounded-full"
                                                    />
                                                ) : (
                                                    <span className="text-white font-semibold text-sm drop-shadow-lg">
                                                        {overdue.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-white drop-shadow-lg">
                                                    {overdue.name}
                                                </p>
                                                <p className="text-xs text-gray-300">
                                                    {overdue.trainingName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="px-2.5 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/40 shadow-md backdrop-blur-sm">
                                                Overdue
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {overdue.deadline}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* View All Button */}
            <div className="mt-6 pt-4 border-t border-white/20">
                <button
                    onClick={handleViewAll}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-gray-700/70 text-sm"
                >
                    View All Enrollments
                </button>
            </div>
        </div>
    );
};

export default TrainingProgressCard;
