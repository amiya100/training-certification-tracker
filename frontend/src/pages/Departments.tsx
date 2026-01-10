// Departments.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import { type Department, type DepartmentFormData } from "../types/department";
import ToastContainer from "../components/ToastContainer";
import AddDepartmentPopup from "../components/Popups/AddDepartmentPopup";
import EditDepartmentPopup from "../components/Popups/EditDepartmentPopup";

const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<
        Department[]
    >([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);
    const { toasts, addToast, removeToast } = useToast();

    // Fetch departments data
    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const departmentsData = await apiService.getDepartments();

            setDepartments(departmentsData);
            setFilteredDepartments(departmentsData);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load departments"
            );
            addToast("Failed to load departments", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    // Handle search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredDepartments(departments);
            return;
        }

        const filtered = departments.filter(
            (dept) =>
                dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dept.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        setFilteredDepartments(filtered);
    }, [searchTerm, departments]);

    // Handle create department
    const handleCreateDepartment = useCallback(
        async (departmentData: DepartmentFormData) => {
            try {
                const newDepartment = await apiService.createDepartment(
                    departmentData
                );

                setDepartments((prev) => [...prev, newDepartment]);
                setShowCreatePopup(false);
                addToast("Department created successfully!", "success");
            } catch (error) {
                console.error("Error creating department:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to create department";
                addToast(errorMessage, "error");
                throw error;
            }
        },
        [addToast]
    );

    // Handle edit department
    const handleEditDepartment = useCallback(
        async (
            departmentData: DepartmentFormData & {
                id: number;
            }
        ) => {
            try {
                // Just send the data as-is
                const updatedDepartment = await apiService.updateDepartment(
                    departmentData
                );

                setDepartments((prev) =>
                    prev.map((dept) =>
                        dept.id === updatedDepartment.id
                            ? updatedDepartment
                            : dept
                    )
                );
                setShowEditPopup(false);
                setSelectedDepartment(null);
                addToast("Department updated successfully!", "success");
            } catch (error) {
                console.error("Error updating department:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to update department";
                addToast(errorMessage, "error");
                throw error;
            }
        },
        [addToast]
    );

    // Handle delete department
    const handleDeleteDepartment = useCallback(
        async (departmentId: number) => {
            try {
                await apiService.deleteDepartment(departmentId);

                setDepartments((prev) =>
                    prev.filter((dept) => dept.id !== departmentId)
                );
                addToast("Department deleted successfully!", "success");
            } catch (error) {
                console.error("Error deleting department:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to delete department";
                addToast(errorMessage, "error");
            }
        },
        [addToast]
    );

    // Initial fetch
    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Loading state
    if (loading && departments.length === 0) {
        return <DepartmentsSkeleton />;
    }

    return (
        <>
            <div className="p-5 space-y-5">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Departments
                            </h1>
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
                                    placeholder="Search departments..."
                                    className="pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <button
                                onClick={() => setShowCreatePopup(true)}
                                className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-xl text-white hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
                                Add Department
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && departments.length === 0 && (
                    <ErrorState error={error} onRetry={fetchDepartments} />
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <StatCard
                        title="Total Departments"
                        value={departments.length.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
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
                        }
                        bgColor="bg-blue-500"
                    />

                    <StatCard
                        title="Avg. Team Size"
                        value={Math.round(
                            departments.reduce(
                                (sum, dept) =>
                                    sum + (dept.total_employees || 0),
                                0
                            ) / Math.max(departments.length, 1)
                        ).toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <path d="M20 8v6" />
                                <path d="M23 11h-6" />
                            </svg>
                        }
                        bgColor="bg-purple-500"
                    />
                </div>

                {/* Departments Table */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                    {filteredDepartments.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                No departments found
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {searchTerm
                                    ? "Try a different search term"
                                    : "Get started by creating your first department"}
                            </p>
                            <button
                                onClick={() => setShowCreatePopup(true)}
                                className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-xl text-white hover:bg-blue-700 transition-all duration-300"
                            >
                                Create Department
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-2xl border border-white/10">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead>
                                        <tr className="bg-white/5 backdrop-blur-sm">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Department
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Employees
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredDepartments.map((dept) => (
                                            <tr
                                                key={dept.id}
                                                className="hover:bg-white/5 transition-colors duration-200 group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${getDepartmentColor(
                                                                dept.name
                                                            )}`}
                                                        >
                                                            <span className="text-white font-bold">
                                                                {dept.name.charAt(
                                                                    0
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                                                                {dept.name}
                                                            </div>
                                                            {dept.description && (
                                                                <div className="text-sm text-gray-300 truncate max-w-xs">
                                                                    {
                                                                        dept.description
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="text-white font-semibold">
                                                            {dept.total_employees ||
                                                                0}
                                                        </span>
                                                        <div className="ml-3 w-24 bg-gray-700/50 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-500 h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        (dept.total_employees ||
                                                                            0) *
                                                                            5,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDepartment(
                                                                    dept
                                                                );
                                                                setShowEditPopup(
                                                                    true
                                                                );
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
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
                                                                handleDeleteDepartment(
                                                                    dept.id
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
                                        {filteredDepartments.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-white">
                                        {departments.length}
                                    </span>{" "}
                                    departments
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

            {/* Create Department Popup */}
            <AddDepartmentPopup
                isOpen={showCreatePopup}
                onClose={() => setShowCreatePopup(false)}
                onSave={handleCreateDepartment}
            />

            {/* Edit Department Popup */}
            {selectedDepartment && (
                <EditDepartmentPopup
                    isOpen={showEditPopup}
                    onClose={() => {
                        setShowEditPopup(false);
                        setSelectedDepartment(null);
                    }}
                    onSave={handleEditDepartment}
                    department={selectedDepartment}
                />
            )}

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

// Helper function for department colors
const getDepartmentColor = (departmentName: string): string => {
    const colors = [
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
        departmentName
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

// Loading Skeleton
const DepartmentsSkeleton = () => (
    <div className="p-5 space-y-5">
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded-xl w-1/4"></div>
            <div className="h-4 bg-gray-700/50 rounded-xl w-1/3 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
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
                Failed to Load Departments
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
                {error ||
                    "Unable to load departments data. Please check your connection and try again."}
            </p>
            <div className="flex justify-center space-x-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300"
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

export default Departments;
