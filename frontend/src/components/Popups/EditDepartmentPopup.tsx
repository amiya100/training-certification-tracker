// components/EditDepartmentPopup.tsx
import React, { useState, useEffect } from "react";
import {
    type DepartmentFormData,
    type Department,
} from "../../types/department";

interface EditDepartmentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        departmentData: DepartmentFormData & { id: number }
    ) => Promise<void>;
    department: Department | null;
}

const EditDepartmentPopup: React.FC<EditDepartmentPopupProps> = ({
    isOpen,
    onClose,
    onSave,
    department,
}) => {
    const [formData, setFormData] = useState<
        DepartmentFormData & { id: number }
    >({
        id: 0,
        name: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data when department changes or popup opens
    useEffect(() => {
        if (department) {
            setFormData({
                id: department.id,
                name: department.name || "",
                description: department.description || "",
            });
        }
        setErrors({});
    }, [department, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Department name is required";
        }

        if (formData.description && !formData.description.trim()) {
            newErrors.description = "Description is required";
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
            await onSave(formData);
        } catch (error) {
            console.error("Error updating department:", error);
            // You could set a general error message here
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    if (!isOpen || !department) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Popup Container */}
            <div className="min-h-screen px-4 py-4 grid place-items-center">
                <div className="w-full max-w-xl">
                    {/* Card - Updated to match dashboard theme */}
                    <div className="bg-[#1a1a1a] rounded-3xl p-0.5">
                        {/* Inner card with gradient */}
                        <div className="bg-gradient-to-r from-transparent via-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                            {/* Header */}
                            <div className="p-5 border-b border-white/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl border border-white/30">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-white drop-shadow-lg"
                                            >
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="18"
                                                    height="18"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <line
                                                    x1="3"
                                                    y1="9"
                                                    x2="21"
                                                    y2="9"
                                                />
                                                <line
                                                    x1="9"
                                                    y1="21"
                                                    x2="9"
                                                    y2="9"
                                                />
                                                <path d="M15 3v6" />
                                                <path d="M9 3v6" />
                                                <path d="M3 15h18" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                                Edit Department
                                            </h2>
                                            <p className="text-xs text-gray-300">
                                                Update department information
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
                                className="p-5 space-y-4"
                            >
                                {/* Department ID (hidden but shown for reference) */}
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-blue-400"
                                    >
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    <span>Department ID: {department.id}</span>
                                </div>

                                {/* Department Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Department Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.name
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="e.g., Engineering, Marketing, HR"
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 text-xs text-red-400 flex items-center">
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="mr-1.5"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                    />
                                                    <line
                                                        x1="12"
                                                        y1="8"
                                                        x2="12"
                                                        y2="12"
                                                    />
                                                    <line
                                                        x1="12"
                                                        y1="16"
                                                        x2="12.01"
                                                        y2="16"
                                                    />
                                                </svg>
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Description *
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.description
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm resize-none`}
                                            placeholder="Provide a detailed description of the department's purpose and responsibilities..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Info Section */}
                                <div className="pt-3 border-t border-white/10">
                                    <h3 className="text-sm font-medium text-gray-200 mb-3 drop-shadow-lg">
                                        Additional Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className="text-emerald-400"
                                                    >
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                        <circle
                                                            cx="9"
                                                            cy="7"
                                                            r="4"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Created
                                                    </p>
                                                    <p className="text-sm text-white font-medium">
                                                        {department.created_at
                                                            ? new Date(
                                                                  department.created_at
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className="text-amber-400"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Last Updated
                                                    </p>
                                                    <p className="text-sm text-white font-medium">
                                                        {department.updated_at
                                                            ? new Date(
                                                                  department.updated_at
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-3 pt-5">
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
                                        className="flex-1 py-2.5 px-5 bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm border border-blue-500/30 rounded-xl text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
                                            "Update Department"
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

export default EditDepartmentPopup;
