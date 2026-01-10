// components/EditEnrollmentPopup.tsx
import React, { useState, useEffect } from "react";
import { type Enrollment } from "../../types/enrollment";
import type { Employee } from "../../types/employee";
import type { Training } from "../../types/training";

interface EditEnrollmentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (enrollmentId: number, enrollmentData: any) => Promise<void>;
    enrollment: Enrollment; // Use the actual Enrollment type
    employees: Employee[];
    trainings: Training[];
}

const EditEnrollmentPopup: React.FC<EditEnrollmentPopupProps> = ({
    isOpen,
    onClose,
    onSave,
    enrollment,
    employees = [],
    trainings = [],
}) => {
    const [formData, setFormData] = useState<{
        employee_id: number;
        training_id: number;
        status: string;
        progress: number;
        start_date: string;
        end_date: string;
    }>({
        employee_id: enrollment.employee_id,
        training_id: enrollment.training_id,
        status: enrollment.status,
        progress: enrollment.progress || 0,
        start_date: enrollment.start_date
            ? enrollment.start_date.split("T")[0]
            : "",
        end_date: enrollment.end_date ? enrollment.end_date.split("T")[0] : "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update form data when enrollment prop changes
    useEffect(() => {
        setFormData({
            employee_id: enrollment.employee_id,
            training_id: enrollment.training_id,
            status: enrollment.status,
            progress: enrollment.progress || 0,
            start_date: enrollment.start_date
                ? enrollment.start_date.split("T")[0]
                : "",
            end_date: enrollment.end_date
                ? enrollment.end_date.split("T")[0]
                : "",
        });
    }, [enrollment]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.employee_id) {
            newErrors.employee_id = "Please select an employee";
        }

        if (!formData.training_id) {
            newErrors.training_id = "Please select a training program";
        }

        if (!formData.start_date) {
            newErrors.start_date = "Start date is required";
        }

        if (!formData.end_date) {
            newErrors.end_date = "End date is required";
        } else if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            if (end <= start) {
                newErrors.end_date = "End date must be after start date";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Only send fields that can be updated (exclude employee_id and training_id)
            const updateData = {
                status: formData.status,
                progress: formData.progress,
                start_date: formData.start_date,
                end_date: formData.end_date,
                // Don't include employee_id and training_id
            };

            await onSave(enrollment.id, updateData);
        } catch (error) {
            console.error("Error updating enrollment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "progress" ? parseInt(value) || 0 : value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleStatusChange = (status: string) => {
        setFormData((prev) => ({
            ...prev,
            status,
            progress: status === "completed" ? 100 : prev.progress,
        }));
    };

    if (!isOpen) return null;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Popup Container */}
            <div className="min-h-screen px-4 py-4 grid place-items-center">
                <div className="w-full max-w-2xl">
                    {/* Card - Updated to match dashboard theme */}
                    <div className="bg-[#1a1a1a] rounded-3xl p-0.5">
                        {/* Inner card with gradient */}
                        <div className="bg-gradient-to-r from-transparent via-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                            {/* Header */}
                            <div className="p-5 border-b border-white/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl border border-white/30">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-white drop-shadow-lg"
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <polyline points="17 11 19 13 23 9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                                Edit Enrollment
                                            </h2>
                                            <p className="text-xs text-gray-300">
                                                Update enrollment details
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="text-gray-400"
                                        >
                                            <line
                                                x1="18"
                                                y1="6"
                                                x2="6"
                                                y2="18"
                                            />
                                            <line
                                                x1="6"
                                                y1="6"
                                                x2="18"
                                                y2="18"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="p-5 space-y-6"
                            >
                                {/* Employee Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Employee *
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="employee_id"
                                            value={formData.employee_id}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.employee_id
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm appearance-none`}
                                            disabled
                                        >
                                            <option value="">
                                                Select an employee
                                            </option>
                                            {employees.map((employee) => (
                                                <option
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {`${employee.first_name} ${employee.last_name}`}{" "}
                                                    - {employee.position}
                                                    {employee.department
                                                        ? ` (${employee.department.name})`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {errors.employee_id && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.employee_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Training Program Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Training Program *
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="training_id"
                                            value={formData.training_id}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.training_id
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm appearance-none`}
                                            disabled
                                        >
                                            <option value="">
                                                Select a training program
                                            </option>
                                            {trainings.map((training) => (
                                                <option
                                                    key={training.id}
                                                    value={training.id}
                                                >
                                                    {training.name} (
                                                    {training.duration_hours}{" "}
                                                    hours)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {errors.training_id && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.training_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Status *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            "enrolled",
                                            "in_progress",
                                            "completed",
                                            "cancelled",
                                        ].map((status) => (
                                            <button
                                                type="button"
                                                key={status}
                                                onClick={() =>
                                                    handleStatusChange(status)
                                                }
                                                className={`py-2.5 px-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                                                    formData.status === status
                                                        ? getStatusButtonColor(
                                                              status
                                                          )
                                                        : "bg-gray-700/30 text-gray-300 border-white/20 hover:bg-gray-700/50"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            formData.status ===
                                                            status
                                                                ? getStatusDotColor(
                                                                      status
                                                                  )
                                                                : "bg-gray-500"
                                                        }`}
                                                    ></div>
                                                    <span className="text-sm font-medium capitalize">
                                                        {status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Progress (%)
                                    </label>
                                    <input
                                        type="range"
                                        name="progress"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        disabled={
                                            formData.status === "completed"
                                        }
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>0%</span>
                                        <span className="text-blue-300 font-medium">
                                            {formData.progress}%
                                        </span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                            Start Date *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="text-gray-400"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="4"
                                                        width="18"
                                                        height="18"
                                                        rx="2"
                                                        ry="2"
                                                    ></rect>
                                                    <line
                                                        x1="16"
                                                        y1="2"
                                                        x2="16"
                                                        y2="6"
                                                    ></line>
                                                    <line
                                                        x1="8"
                                                        y1="2"
                                                        x2="8"
                                                        y2="6"
                                                    ></line>
                                                    <line
                                                        x1="3"
                                                        y1="10"
                                                        x2="21"
                                                        y2="10"
                                                    ></line>
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                    errors.start_date
                                                        ? "border-red-500/50"
                                                        : "border-white/20"
                                                } rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            />
                                            {errors.start_date && (
                                                <p className="mt-1.5 text-xs text-red-400">
                                                    {errors.start_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                            End Date *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="text-gray-400"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="4"
                                                        width="18"
                                                        height="18"
                                                        rx="2"
                                                        ry="2"
                                                    ></rect>
                                                    <line
                                                        x1="16"
                                                        y1="2"
                                                        x2="16"
                                                        y2="6"
                                                    ></line>
                                                    <line
                                                        x1="8"
                                                        y1="2"
                                                        x2="8"
                                                        y2="6"
                                                    ></line>
                                                    <line
                                                        x1="3"
                                                        y1="10"
                                                        x2="21"
                                                        y2="10"
                                                    ></line>
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                min={
                                                    formData.start_date || today
                                                }
                                                className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                    errors.end_date
                                                        ? "border-red-500/50"
                                                        : "border-white/20"
                                                } rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            />
                                            {errors.end_date && (
                                                <p className="mt-1.5 text-xs text-red-400">
                                                    {errors.end_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-2.5 px-5 bg-gray-700/50 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-semibold shadow-lg text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-sm border border-indigo-500/30 rounded-xl text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Enrollment"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions for status colors
const getStatusButtonColor = (status: string): string => {
    switch (status) {
        case "enrolled":
            return "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg hover:shadow-xl";
        case "in_progress":
            return "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg hover:shadow-xl";
        case "completed":
            return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg hover:shadow-xl";
        case "cancelled":
            return "bg-red-500/20 text-red-300 border-red-500/40 shadow-lg hover:shadow-xl";
        default:
            return "bg-gray-500/20 text-gray-300 border-gray-500/40";
    }
};

const getStatusDotColor = (status: string): string => {
    switch (status) {
        case "enrolled":
            return "bg-purple-400";
        case "in_progress":
            return "bg-blue-400";
        case "completed":
            return "bg-emerald-400";
        case "cancelled":
            return "bg-red-400";
        default:
            return "bg-gray-400";
    }
};

export default EditEnrollmentPopup;
