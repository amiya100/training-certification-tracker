// components/Popups/EditEmployeePopup.tsx
import React, { useState, useEffect } from "react";
import { type EmployeeFormData } from "../../types/employee";
import { type Department } from "../../types/department";
import { type Employee } from "../../types/employee";

interface EditEmployeePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: EmployeeFormData & { id: number }) => Promise<void>;
    employee: Employee | null;
    departments: Department[];
}

const EditEmployeePopup: React.FC<EditEmployeePopupProps> = ({
    isOpen,
    onClose,
    onSave,
    employee,
    departments,
}) => {
    const [formData, setFormData] = useState<EmployeeFormData & { id: number }>(
        {
            id: 0,
            employee_id: "",
            first_name: "",
            last_name: "",
            email: "",
            department_id: null,
            position: "",
            hire_date: new Date().toISOString().split("T")[0],
        }
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data when employee changes or popup opens
    useEffect(() => {
        if (employee) {
            setFormData({
                id: employee.id,
                employee_id: employee.employee_id || "",
                first_name: employee.first_name || "",
                last_name: employee.last_name || "",
                email: employee.email || "",
                department_id: employee.department_id || null,
                position: employee.position || "",
                hire_date: employee.hire_date
                    ? new Date(employee.hire_date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
            });
        }
        setErrors({});
    }, [employee, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.employee_id.trim()) {
            newErrors.employee_id = "Employee ID is required";
        }

        if (!formData.first_name.trim()) {
            newErrors.first_name = "First name is required";
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = "Last name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.position.trim()) {
            newErrors.position = "Position is required";
        }

        if (!formData.hire_date) {
            newErrors.hire_date = "Hire date is required";
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
            console.error("Error updating employee:", error);
            // You could set a general error message here
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
            [name]:
                name === "department_id"
                    ? value === ""
                        ? null
                        : Number(value)
                    : value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    if (!isOpen || !employee) return null;

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
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl border border-white/30">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-white drop-shadow-lg"
                                            >
                                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                                <path d="M16 3.13a4 4 0 010 7.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                                Edit Employee
                                            </h2>
                                            <p className="text-xs text-gray-300">
                                                Update employee information
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
                                {/* Employee ID Reference */}
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
                                    <span>
                                        Employee ID: {employee.employee_id}
                                    </span>
                                </div>

                                {/* Employee ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Employee ID *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="employee_id"
                                            value={formData.employee_id}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.employee_id
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="EMP-001"
                                        />
                                        {errors.employee_id && (
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
                                                {errors.employee_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* First Name & Last Name */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.first_name
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="John"
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.last_name
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="Doe"
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-gray-400"
                                            >
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.email
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="john.doe@company.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Position & Department */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                            Position *
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.position
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="Software Engineer"
                                        />
                                        {errors.position && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.position}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="department_id"
                                                value={
                                                    formData.department_id || ""
                                                }
                                                onChange={handleChange}
                                                className="w-full bg-gray-700/30 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm pr-8"
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="text-gray-400"
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hire Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Hire Date *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                                                />
                                                <line
                                                    x1="16"
                                                    y1="2"
                                                    x2="16"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="8"
                                                    y1="2"
                                                    x2="8"
                                                    y2="6"
                                                />
                                                <line
                                                    x1="3"
                                                    y1="10"
                                                    x2="21"
                                                    y2="10"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="date"
                                            name="hire_date"
                                            value={formData.hire_date}
                                            onChange={handleChange}
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.hire_date
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                        />
                                        {errors.hire_date && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.hire_date}
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
                                                        Created
                                                    </p>
                                                    <p className="text-sm text-white font-medium">
                                                        {employee.created_at
                                                            ? new Date(
                                                                  employee.created_at
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
                                                        {employee.updated_at
                                                            ? new Date(
                                                                  employee.updated_at
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
                                            "Update Employee"
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

export default EditEmployeePopup;
