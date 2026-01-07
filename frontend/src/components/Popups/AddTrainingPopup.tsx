// components/AddTrainingPopup.tsx
import React, { useState } from "react";
import { type TrainingFormData } from "../../types/training";

interface AddTrainingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trainingData: TrainingFormData) => Promise<void>;
}

const AddTrainingPopup: React.FC<AddTrainingPopupProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState<TrainingFormData>({
        name: "",
        description: "",
        duration_hours: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Training name is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (formData.duration_hours === "" || formData.duration_hours === 0) {
            newErrors.duration_hours = "Duration is required";
        } else if (
            typeof formData.duration_hours === "number" &&
            formData.duration_hours < 0
        ) {
            newErrors.duration_hours = "Duration must be positive";
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
            console.error("Error saving training:", error);
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
            [name]:
                name === "duration_hours"
                    ? value === ""
                        ? ""
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

    if (!isOpen) return null;

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
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl border border-white/30">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-white drop-shadow-lg"
                                            >
                                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                                Add Training Program
                                            </h2>
                                            <p className="text-xs text-gray-300">
                                                Create a new training program
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
                                {/* Training Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Training Name *
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
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="e.g., Python Programming Fundamentals"
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

                                {/* Duration Hours */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-lg">
                                        Duration (Hours) *
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
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            name="duration_hours"
                                            value={formData.duration_hours}
                                            onChange={handleChange}
                                            step="0.5"
                                            min="0"
                                            className={`w-full bg-gray-700/30 backdrop-blur-sm border ${
                                                errors.duration_hours
                                                    ? "border-red-500/50"
                                                    : "border-white/20"
                                            } rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm`}
                                            placeholder="e.g., 8.5"
                                        />
                                        {errors.duration_hours && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.duration_hours}
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
                                            } rounded-xl px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm resize-none`}
                                            placeholder="Provide a detailed description of the training program..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1.5 text-xs text-red-400">
                                                {errors.description}
                                            </p>
                                        )}
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
                                        className="flex-1 py-2.5 px-5 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Training"
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

export default AddTrainingPopup;
