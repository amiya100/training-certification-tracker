import React, { useState } from "react";
import AddEmployeePopup from "./AddEmployeePopup";
import AddTrainingPopup from "./AddTrainingPopup";
import AddDepartmentPopup from "./AddDepartmentPopup";
import ToastContainer, {
    type ToastMessage,
} from "../components/ToastContainer";
import { type EmployeeFormData, type Department } from "../types/employee";
import { type TrainingFormData } from "../types/training";

interface DepartmentFormData {
    name: string;
    description: string;
}

const WelcomeSection: React.FC<{
    departments?: Department[];
    onRefreshDashboard?: () => void;
}> = ({ departments = [], onRefreshDashboard }) => {
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [showAddTraining, setShowAddTraining] = useState(false);
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Helper function to add toast
    const addToast = (message: string, type: ToastMessage["type"]) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    // Helper function to remove toast
    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const handleSaveEmployee = async (employeeData: EmployeeFormData) => {
        try {
            const submitData = {
                ...employeeData,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log("Submitting employee data:", submitData);

            const response = await fetch("http://localhost:8000/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to save employee: ${response.status} - ${errorText}`
                );
            }

            const result = await response.json();
            console.log("Employee saved successfully:", result);

            // Close modal
            setShowAddEmployee(false);

            // Show success toast
            addToast("Employee added successfully!", "success");

            // Notify parent Dashboard to refresh all data
            onRefreshDashboard?.();
        } catch (error) {
            console.error("Error saving employee:", error);

            // Show error toast
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to add employee. Please try again.";

            addToast(errorMessage, "error");

            // Re-throw the error for the popup to handle
            throw error;
        }
    };

    const handleSaveTraining = async (trainingData: TrainingFormData) => {
        try {
            // Prepare the data for submission
            const submitData = {
                ...trainingData,
                duration_hours: Number(trainingData.duration_hours),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log("Submitting training data:", submitData);

            const response = await fetch("http://localhost:8000/trainings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to save training: ${response.status} - ${errorText}`
                );
            }

            const result = await response.json();
            console.log("Training saved successfully:", result);

            // Close modal
            setShowAddTraining(false);

            // Show success toast
            addToast("Training program added successfully!", "success");

            // Notify parent Dashboard to refresh all data
            onRefreshDashboard?.();
        } catch (error) {
            console.error("Error saving training:", error);

            // Show error toast
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to add training program. Please try again.";

            addToast(errorMessage, "error");

            // Re-throw the error for the popup to handle
            throw error;
        }
    };

    const handleSaveDepartment = async (departmentData: DepartmentFormData) => {
        try {
            const submitData = {
                ...departmentData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log("Submitting department data:", submitData);

            const response = await fetch("http://localhost:8000/departments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to save department: ${response.status} - ${errorText}`
                );
            }

            const result = await response.json();
            console.log("Department saved successfully:", result);

            // Close modal
            setShowAddDepartment(false);

            // Show success toast
            addToast("Department added successfully!", "success");

            // Notify parent Dashboard to refresh all data
            onRefreshDashboard?.();
        } catch (error) {
            console.error("Error saving department:", error);

            // Show error toast
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to add department. Please try again.";

            addToast(errorMessage, "error");

            // Re-throw the error for the popup to handle
            throw error;
        }
    };

    return (
        <>
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <img
                                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                                alt="Adrian"
                                className="w-16 h-16 rounded-full border-3 border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white/30 shadow-lg ring-1 ring-emerald-500/50 flex items-center justify-center">
                                <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-white"
                                >
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                Welcome Back, Adrian
                            </h2>
                            <p className="text-sm text-gray-300">
                                Manage your team and training programs
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddEmployee(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-sm border border-blue-500/30 rounded-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 group"
                        >
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-white group-hover:scale-110 transition-transform duration-300"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <span className="font-medium text-white text-sm leading-none">
                                Add Employee
                            </span>
                        </button>

                        <button
                            onClick={() => setShowAddTraining(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 group"
                        >
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-white group-hover:scale-110 transition-transform duration-300"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <span className="font-medium text-white text-sm leading-none">
                                Add Training Program
                            </span>
                        </button>

                        <button
                            onClick={() => setShowAddDepartment(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 backdrop-blur-sm border border-purple-500/30 rounded-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 group"
                        >
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-white group-hover:scale-110 transition-transform duration-300"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <span className="font-medium text-white text-sm leading-none">
                                Add Department
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <AddEmployeePopup
                isOpen={showAddEmployee}
                onClose={() => setShowAddEmployee(false)}
                onSave={handleSaveEmployee}
                departments={departments}
            />

            <AddTrainingPopup
                isOpen={showAddTraining}
                onClose={() => setShowAddTraining(false)}
                onSave={handleSaveTraining}
            />

            <AddDepartmentPopup
                isOpen={showAddDepartment}
                onClose={() => setShowAddDepartment(false)}
                onSave={handleSaveDepartment}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default WelcomeSection;
