// Enrollments.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import { type Enrollment } from "../types/enrollment";
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import ToastContainer from "../components/ToastContainer";
import CreateEnrollmentPopup from "../components/Popups/CreateEnrollmentPopup";
import EditEnrollmentPopup from "../components/Popups/EditEnrollmentPopup";
import { type EnrollmentFormData } from "../types/enrollment";

const Enrollments: React.FC = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState<
        Enrollment[]
    >([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] =
        useState<Enrollment | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { toasts, addToast, removeToast } = useToast();

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [enrollmentsData, employeesData, trainingsData] =
                await Promise.all([
                    apiService.getEnrollments(),
                    apiService.getEmployees(),
                    apiService.getTrainings(),
                ]);

            setEnrollments(enrollmentsData);
            setEmployees(employeesData);
            setTrainings(trainingsData);
            setFilteredEnrollments(enrollmentsData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load data",
            );
            addToast("Failed to load enrollment data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    // Handle search and filters
    useEffect(() => {
        let filtered = enrollments;

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (enrollment) => enrollment.status === statusFilter,
            );
        }

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((enrollment) => {
                const employee = employees.find(
                    (e) => e.id === enrollment.employee_id,
                );
                const training = trainings.find(
                    (t) => t.id === enrollment.training_id,
                );

                return (
                    employee?.first_name?.toLowerCase().includes(searchLower) ||
                    employee?.last_name?.toLowerCase().includes(searchLower) ||
                    employee?.email?.toLowerCase().includes(searchLower) ||
                    training?.name?.toLowerCase().includes(searchLower) ||
                    training?.description
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    enrollment.status?.toLowerCase().includes(searchLower)
                );
            });
        }

        setFilteredEnrollments(filtered);
    }, [searchTerm, statusFilter, enrollments, employees, trainings]);

    // Handle create enrollment
    const handleCreateEnrollment = useCallback(
        async (enrollmentData: EnrollmentFormData) => {
            try {
                const newEnrollment =
                    await apiService.createEnrollment(enrollmentData);
                setEnrollments((prev) => [...prev, newEnrollment]);
                setShowCreatePopup(false);
                addToast("Enrollment created successfully!", "success");
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
        [addToast],
    );

    // Handle edit enrollment
    const handleEditEnrollment = useCallback(
        async (enrollmentId: number, enrollmentData: EnrollmentFormData) => {
            try {
                const enrollment = enrollments.find(
                    (e) => e.id === enrollmentId,
                );

                // Prevent editing of completed enrollments
                if (enrollment?.status === "completed") {
                    addToast("Cannot edit completed enrollments", "warning");
                    return;
                }

                const updatedEnrollment = await apiService.updateEnrollment(
                    enrollmentId,
                    enrollmentData,
                );
                setEnrollments((prev) =>
                    prev.map((enrollment) =>
                        enrollment.id === updatedEnrollment.id
                            ? updatedEnrollment
                            : enrollment,
                    ),
                );
                setShowEditPopup(false);
                setSelectedEnrollment(null);
                addToast("Enrollment updated successfully!", "success");
            } catch (error) {
                console.error("Error updating enrollment:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to update enrollment";
                addToast(errorMessage, "error");
                throw error;
            }
        },
        [addToast, enrollments],
    );

    // Handle delete enrollment
    const handleDeleteEnrollment = useCallback(
        async (enrollmentId: number) => {
            const enrollment = enrollments.find((e) => e.id === enrollmentId);

            // Prevent deletion of completed enrollments
            if (enrollment?.status === "completed") {
                addToast("Cannot delete completed enrollments", "warning");
                return;
            }

            try {
                await apiService.deleteEnrollment(enrollmentId);
                setEnrollments((prev) =>
                    prev.filter((enrollment) => enrollment.id !== enrollmentId),
                );
                addToast("Enrollment deleted successfully!", "success");
            } catch (error) {
                console.error("Error deleting enrollment:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to delete enrollment";
                addToast(errorMessage, "error");
            }
        },
        [addToast, enrollments],
    );

    // Handle update progress
    const handleUpdateProgress = useCallback(
        async (enrollmentId: number, progress: number) => {
            const enrollment = enrollments.find((e) => e.id === enrollmentId);

            // Prevent updating progress of completed enrollments
            if (enrollment?.status === "completed") {
                addToast(
                    "Cannot update progress of completed enrollments",
                    "warning",
                );
                return;
            }

            try {
                await apiService.updateEnrollmentProgress(
                    enrollmentId,
                    progress,
                );

                // Update local state
                setEnrollments((prev) =>
                    prev.map((enrollment) => {
                        if (enrollment.id === enrollmentId) {
                            let newStatus = enrollment.status;

                            // Determine new status based on progress
                            if (progress === 100) {
                                newStatus = "completed";
                            } else if (
                                progress > 0 &&
                                enrollment.status === "enrolled"
                            ) {
                                newStatus = "in_progress";
                            }

                            return {
                                ...enrollment,
                                progress,
                                status: newStatus,
                            };
                        }
                        return enrollment;
                    }),
                );

                if (progress === 100) {
                    addToast("Enrollment marked as completed!", "success");
                } else {
                    addToast("Progress updated successfully!", "success");
                }
            } catch (error) {
                console.error("Error updating progress:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to update progress";
                addToast(errorMessage, "error");
            }
        },
        [addToast, enrollments],
    );

    // Handle mark as completed
    const handleMarkCompleted = useCallback(
        async (enrollmentId: number) => {
            const enrollment = enrollments.find((e) => e.id === enrollmentId);

            // Prevent marking already completed enrollments
            if (enrollment?.status === "completed") {
                addToast("This enrollment is already completed", "info");
                return;
            }

            try {
                await apiService.completeEnrollment(enrollmentId);

                // Update local state
                setEnrollments((prev) =>
                    prev.map((enrollment) =>
                        enrollment.id === enrollmentId
                            ? {
                                  ...enrollment,
                                  progress: 100,
                                  status: "completed",
                                  completed_date: new Date().toISOString(),
                              }
                            : enrollment,
                    ),
                );

                addToast("Enrollment marked as completed!", "success");
            } catch (error) {
                console.error("Error marking as completed:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to mark as completed";
                addToast(errorMessage, "error");
            }
        },
        [addToast, enrollments],
    );

    // Handle edit button click
    const handleEditClick = useCallback(
        (enrollment: Enrollment) => {
            if (enrollment.status === "completed") {
                addToast("Cannot edit completed enrollments", "warning");
                return;
            }
            setSelectedEnrollment(enrollment);
            setShowEditPopup(true);
        },
        [addToast],
    );

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Loading state
    if (loading && enrollments.length === 0) {
        return <EnrollmentsSkeleton />;
    }

    // Helper functions
    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((e) => e.id === employeeId);
        return employee
            ? `${employee.first_name} ${employee.last_name}`
            : "Unknown Employee";
    };

    const getTrainingName = (trainingId: number) => {
        const training = trainings.find((t) => t.id === trainingId);
        return training ? training.name : "Unknown Training";
    };

    const getEmployeeDepartment = (employeeId: number) => {
        const employee = employees.find((e) => e.id === employeeId);
        return employee?.department?.name || "No Department";
    };

    const getTrainingDuration = (trainingId: number) => {
        const training = trainings.find((t) => t.id === trainingId);
        return training?.duration_hours || 0;
    };

    // Check if enrollment can be edited
    const canEditEnrollment = (enrollment: Enrollment) => {
        return (
            enrollment.status !== "completed" &&
            enrollment.status !== "cancelled"
        );
    };

    // Check if enrollment can be deleted
    const canDeleteEnrollment = (enrollment: Enrollment) => {
        return enrollment.status !== "completed";
    };

    return (
        <>
            <div className="p-5 space-y-5">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Training Enrollments
                            </h1>
                            <p className="text-gray-300 mt-1">
                                Manage employee enrollments in training programs
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
                                    placeholder="Search enrollments..."
                                    className="pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="enrolled">Enrolled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={() => setShowCreatePopup(true)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-sm border border-indigo-500/30 rounded-xl text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
                                New Enrollment
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && enrollments.length === 0 && (
                    <ErrorState error={error} onRetry={fetchData} />
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatCard
                        title="Total Enrollments"
                        value={enrollments.length.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <polyline points="17 11 19 13 23 9" />
                            </svg>
                        }
                        bgColor="bg-indigo-500"
                    />

                    <StatCard
                        title="Active Enrollments"
                        value={enrollments
                            .filter(
                                (e) =>
                                    e.status === "enrolled" ||
                                    e.status === "in_progress",
                            )
                            .length.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                        bgColor="bg-emerald-500"
                    />

                    <StatCard
                        title="Completed"
                        value={enrollments
                            .filter((e) => e.status === "completed")
                            .length.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        }
                        bgColor="bg-green-500"
                    />
                </div>

                {/* Enrollments Table */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                    {filteredEnrollments.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <polyline points="17 11 19 13 23 9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                No enrollments found
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try different search criteria"
                                    : "Get started by creating your first enrollment"}
                            </p>
                            <button
                                onClick={() => setShowCreatePopup(true)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-sm border border-indigo-500/30 rounded-xl text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                            >
                                Create Enrollment
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-2xl border border-white/10">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead>
                                        <tr className="bg-white/5 backdrop-blur-sm">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Training Program
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Status & Progress
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Dates
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredEnrollments.map(
                                            (enrollment) => (
                                                <tr
                                                    key={enrollment.id}
                                                    className="hover:bg-white/5 transition-colors duration-200 group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div
                                                                className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${getEmployeeColor(
                                                                    enrollment.employee_id,
                                                                )}`}
                                                            >
                                                                <span className="text-white font-bold">
                                                                    {getEmployeeName(
                                                                        enrollment.employee_id,
                                                                    ).charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                                                                    {getEmployeeName(
                                                                        enrollment.employee_id,
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-300">
                                                                    {getEmployeeDepartment(
                                                                        enrollment.employee_id,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-gray-300">
                                                            <div
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${getTrainingColor(
                                                                    enrollment.training_id,
                                                                )}`}
                                                            >
                                                                <span className="text-white text-xs font-bold">
                                                                    {getTrainingName(
                                                                        enrollment.training_id,
                                                                    ).charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-white">
                                                                    {getTrainingName(
                                                                        enrollment.training_id,
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-300">
                                                                    {getTrainingDuration(
                                                                        enrollment.training_id,
                                                                    )}{" "}
                                                                    hours
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-2">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                                    enrollment.status,
                                                                )}`}
                                                            >
                                                                {enrollment.status
                                                                    ?.replace(
                                                                        "_",
                                                                        " ",
                                                                    )
                                                                    .toUpperCase()}
                                                            </span>
                                                            {(enrollment.status ===
                                                                "in_progress" ||
                                                                enrollment.status ===
                                                                    "enrolled") && (
                                                                <div className="w-full">
                                                                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                                                                        <span>
                                                                            Progress
                                                                        </span>
                                                                        <span>
                                                                            {enrollment.progress ||
                                                                                0}
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                                                                            style={{
                                                                                width: `${
                                                                                    enrollment.progress ||
                                                                                    0
                                                                                }%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="flex gap-1 mt-2">
                                                                        {[
                                                                            0,
                                                                            25,
                                                                            50,
                                                                            75,
                                                                            100,
                                                                        ].map(
                                                                            (
                                                                                value,
                                                                            ) => (
                                                                                <button
                                                                                    key={
                                                                                        value
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleUpdateProgress(
                                                                                            enrollment.id,
                                                                                            value,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        enrollment.status ===
                                                                                        "completed"
                                                                                    }
                                                                                    className={`text-xs px-2 py-1 rounded transition-colors ${
                                                                                        enrollment.status ===
                                                                                        "completed"
                                                                                            ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                                                                                            : "bg-gray-700/50 hover:bg-gray-600"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        value
                                                                                    }

                                                                                    %
                                                                                </button>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1 text-sm">
                                                            <div className="text-gray-300">
                                                                <span className="text-gray-400">
                                                                    Start:{" "}
                                                                </span>
                                                                {enrollment.start_date
                                                                    ? new Date(
                                                                          enrollment.start_date,
                                                                      ).toLocaleDateString()
                                                                    : "Not set"}
                                                            </div>
                                                            <div className="text-gray-300">
                                                                <span className="text-gray-400">
                                                                    End:{" "}
                                                                </span>
                                                                {enrollment.end_date
                                                                    ? new Date(
                                                                          enrollment.end_date,
                                                                      ).toLocaleDateString()
                                                                    : "Not set"}
                                                            </div>
                                                            {enrollment.completed_date && (
                                                                <div className="text-emerald-300">
                                                                    <span className="text-gray-400">
                                                                        Completed:{" "}
                                                                    </span>
                                                                    {new Date(
                                                                        enrollment.completed_date,
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditClick(
                                                                        enrollment,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !canEditEnrollment(
                                                                        enrollment,
                                                                    )
                                                                }
                                                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                                                    canEditEnrollment(
                                                                        enrollment,
                                                                    )
                                                                        ? "text-gray-400 hover:text-indigo-400 hover:bg-white/5"
                                                                        : "text-gray-600 bg-gray-800/30 cursor-not-allowed"
                                                                }`}
                                                                title={
                                                                    canEditEnrollment(
                                                                        enrollment,
                                                                    )
                                                                        ? "Edit"
                                                                        : "Cannot edit completed or cancelled enrollments"
                                                                }
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
                                                            {enrollment.status !==
                                                                "completed" &&
                                                                enrollment.status !==
                                                                    "cancelled" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleMarkCompleted(
                                                                                enrollment.id,
                                                                            )
                                                                        }
                                                                        className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                                                        title="Mark as Completed"
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
                                                                                d="M5 13l4 4L19 7"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteEnrollment(
                                                                        enrollment.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !canDeleteEnrollment(
                                                                        enrollment,
                                                                    )
                                                                }
                                                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                                                    canDeleteEnrollment(
                                                                        enrollment,
                                                                    )
                                                                        ? "text-gray-400 hover:text-red-400 hover:bg-white/5"
                                                                        : "text-gray-600 bg-gray-800/30 cursor-not-allowed"
                                                                }`}
                                                                title={
                                                                    canDeleteEnrollment(
                                                                        enrollment,
                                                                    )
                                                                        ? "Delete"
                                                                        : "Cannot delete completed enrollments"
                                                                }
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
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination/Info */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-white/10">
                                <div className="text-gray-300 text-sm mb-4 sm:mb-0">
                                    Showing{" "}
                                    <span className="font-semibold text-white">
                                        {filteredEnrollments.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-white">
                                        {enrollments.length}
                                    </span>{" "}
                                    enrollments
                                </div>
                                <div className="flex gap-2">
                                    {(searchTerm || statusFilter !== "all") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setStatusFilter("all");
                                            }}
                                            className="px-4 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create Enrollment Popup */}
            <CreateEnrollmentPopup
                isOpen={showCreatePopup}
                onClose={() => setShowCreatePopup(false)}
                onSave={handleCreateEnrollment}
                employees={employees}
                trainings={trainings}
            />

            {/* Edit Enrollment Popup */}
            {selectedEnrollment && (
                <EditEnrollmentPopup
                    isOpen={showEditPopup}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedEnrollment(null);
                    }}
                    onSave={handleEditEnrollment}
                    enrollment={selectedEnrollment}
                    employees={employees}
                    trainings={trainings}
                />
            )}

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

// Helper functions
const getEmployeeColor = (employeeId: number): string => {
    const colors = [
        "bg-indigo-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-blue-500",
    ];
    const index = employeeId % colors.length;
    return colors[index];
};

const getTrainingColor = (trainingId: number): string => {
    const colors = [
        "bg-indigo-600",
        "bg-purple-600",
        "bg-pink-600",
        "bg-red-600",
        "bg-orange-600",
        "bg-yellow-600",
        "bg-green-600",
        "bg-teal-600",
        "bg-cyan-600",
        "bg-blue-600",
    ];
    const index = trainingId % colors.length;
    return colors[index];
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case "enrolled":
            return "bg-purple-500/20 text-purple-300 border border-purple-500/40";
        case "in_progress":
            return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
        case "completed":
            return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
        case "cancelled":
            return "bg-red-500/20 text-red-300 border border-red-500/40";
        default:
            return "bg-gray-500/20 text-gray-300 border border-gray-500/40";
    }
};

// Loading Skeleton
const EnrollmentsSkeleton = () => (
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
                Failed to Load Enrollments
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
                {error ||
                    "Unable to load enrollment data. Please check your connection and try again."}
            </p>
            <div className="flex justify-center space-x-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-sm border border-indigo-500/30 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
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

export default Enrollments;
