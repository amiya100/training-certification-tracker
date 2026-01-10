// Trainings.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import { type Training, type TrainingFormData } from "../types/training";
import ToastContainer from "../components/ToastContainer";
import AddTrainingPopup from "../components/Popups/AddTrainingPopup";
import EditTrainingPopup from "../components/Popups/EditTrainingPopup";

const Trainings: React.FC = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(
        null
    );
    const { toasts, addToast, removeToast } = useToast();

    // Fetch trainings data
    const fetchTrainings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const trainingsData = await apiService.getTrainings();
            setTrainings(trainingsData);
            setFilteredTrainings(trainingsData);
        } catch (err) {
            console.error("Error fetching trainings:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load trainings"
            );
            addToast("Failed to load trainings data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    // Handle search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredTrainings(trainings);
            return;
        }

        const filtered = trainings.filter(
            (training) =>
                training.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                training.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                training.category
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        setFilteredTrainings(filtered);
    }, [searchTerm, trainings]);

    // Handle create training
    const handleCreateTraining = useCallback(
        async (trainingData: TrainingFormData) => {
            try {
                const newTraining = await apiService.createTraining(
                    trainingData
                );
                setTrainings((prev) => [...prev, newTraining]);
                setShowCreatePopup(false);
                addToast("Training created successfully!", "success");
            } catch (error) {
                console.error("Error creating training:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to create training";
                addToast(errorMessage, "error");
                throw error;
            }
        },
        [addToast]
    );

    // Handle edit training
    const handleEditTraining = useCallback(
        async (trainingData: TrainingFormData & { id: number }) => {
            try {
                const updatedTraining = await apiService.updateTraining(
                    trainingData
                );
                setTrainings((prev) =>
                    prev.map((training) =>
                        training.id === updatedTraining.id
                            ? updatedTraining
                            : training
                    )
                );
                setShowEditPopup(false);
                setSelectedTraining(null);
                addToast("Training updated successfully!", "success");
            } catch (error) {
                console.error("Error updating training:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to update training";
                addToast(errorMessage, "error");
                throw error;
            }
        },
        [addToast]
    );

    // Handle delete training
    const handleDeleteTraining = useCallback(
        async (trainingId: number) => {
            try {
                await apiService.deleteTraining(trainingId);
                setTrainings((prev) =>
                    prev.filter((training) => training.id !== trainingId)
                );
                addToast("Training deleted successfully!", "success");
            } catch (error) {
                console.error("Error deleting training:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to delete training";
                addToast(errorMessage, "error");
            }
        },
        [addToast]
    );

    // Initial fetch
    useEffect(() => {
        fetchTrainings();
    }, [fetchTrainings]);

    // Loading state
    if (loading && trainings.length === 0) {
        return <TrainingsSkeleton />;
    }

    return (
        <>
            <div className="p-5 space-y-5">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Training Programs
                            </h1>
                            <p className="text-gray-300 mt-1">
                                Manage and organize your training programs
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search trainings..."
                                    className="pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <button
                                onClick={() => setShowCreatePopup(true)}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Add Training
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && trainings.length === 0 && (
                    <ErrorState error={error} onRetry={fetchTrainings} />
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <StatCard
                        title="Total Trainings"
                        value={trainings.length.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                />
                            </svg>
                        }
                        bgColor="bg-orange-500"
                    />

                    <StatCard
                        title="Total Hours"
                        value={trainings
                            .reduce(
                                (acc, training) =>
                                    acc + (training.duration_hours || 0),
                                0
                            )
                            .toFixed(1)}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        }
                        bgColor="bg-blue-500"
                    />
                </div>

                {/* Trainings Table */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                    {filteredTrainings.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                No trainings found
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {searchTerm
                                    ? "Try a different search term"
                                    : "Get started by creating your first training program"}
                            </p>
                            <button
                                onClick={() => setShowCreatePopup(true)}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                            >
                                Create Training
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-2xl border border-white/10">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead>
                                        <tr className="bg-white/5 backdrop-blur-sm">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Training Program
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Duration
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredTrainings.map((training) => (
                                            <tr
                                                key={training.id}
                                                className="hover:bg-white/5 transition-colors duration-200 group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${getTrainingColor(
                                                                training.name
                                                            )}`}
                                                        >
                                                            <span className="text-white font-bold">
                                                                {training.name.charAt(
                                                                    0
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white group-hover:text-orange-300 transition-colors">
                                                                {training.name}
                                                            </div>
                                                            <div className="text-sm text-gray-300 line-clamp-2 max-w-md">
                                                                {training.description ||
                                                                    "No description"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-gray-300">
                                                        <svg
                                                            className="w-4 h-4 mr-2 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                            />
                                                            <polyline points="12 6 12 12 16 14" />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {training.duration_hours ||
                                                                0}{" "}
                                                            hours
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="text-gray-300 text-sm">
                                                        {new Date(
                                                            training.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTraining(
                                                                    training
                                                                );
                                                                setShowEditPopup(
                                                                    true
                                                                );
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                                            title="Edit"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteTraining(
                                                                    training.id
                                                                )
                                                            }
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                                            title="Delete"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination/Info */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-white/10">
                                <div className="text-gray-300 text-sm mb-4 sm:mb-0">
                                    Showing{" "}
                                    <span className="font-semibold text-white">
                                        {filteredTrainings.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-white">
                                        {trainings.length}
                                    </span>{" "}
                                    training programs
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="px-4 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create Training Popup */}
            <AddTrainingPopup
                isOpen={showCreatePopup}
                onClose={() => setShowCreatePopup(false)}
                onSave={handleCreateTraining}
            />

            {/* Edit Training Popup */}
            {selectedTraining && (
                <EditTrainingPopup
                    isOpen={showEditPopup}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedTraining(null);
                    }}
                    onSave={handleEditTraining}
                    training={selectedTraining}
                />
            )}

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

// Helper function for training colors
const getTrainingColor = (name: string): string => {
    const colors = [
        "bg-orange-500",
        "bg-blue-500",
        "bg-emerald-500",
        "bg-purple-500",
        "bg-amber-500",
        "bg-pink-500",
        "bg-cyan-500",
        "bg-indigo-500",
        "bg-teal-500",
        "bg-rose-500",
        "bg-violet-500",
    ];

    const index =
        name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;
    return colors[index];
};

// Loading Skeleton
const TrainingsSkeleton = () => (
    <div className="p-5 space-y-5">
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded-xl w-1/4"></div>
            <div className="h-4 bg-gray-700/50 rounded-xl w-1/3 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse"
                >
                    <div className="h-10 w-10 bg-gray-700/50 rounded-xl mb-4"></div>
                    <div className="h-6 bg-gray-700/50 rounded-xl w-1/2"></div>
                    <div className="h-8 bg-gray-700/50 rounded-xl w-1/3 mt-2"></div>
                </div>
            ))}
        </div>

        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse">
            <div className="space-y-4">
                <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-gray-700/50 rounded-xl"
                    ></div>
                ))}
            </div>
        </div>
    </div>
);

// Error State Component
interface ErrorStateProps {
    error: string | null;
    onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
    <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center">
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
                Failed to Load Trainings
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
                {error ||
                    "Unable to load training data. Please check your connection and try again."}
            </p>
            <div className="flex justify-center space-x-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                >
                    Retry
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    </div>
);

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => {
    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] group">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                >
                    {icon}
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
                <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {value}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Trainings;
