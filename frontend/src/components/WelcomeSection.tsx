// WelcomeSection.tsx - Fixed version
import React, { useState } from "react";
import { useToast } from "../hooks/useToast";
import { apiService } from "../services/api";
import AddEmployeePopup from "./Popups/AddEmployeePopup";
import AddTrainingPopup from "./Popups/AddTrainingPopup";
import AddDepartmentPopup from "./Popups/AddDepartmentPopup";
import ToastContainer from "./ToastContainer";
import { type EmployeeFormData } from "../types/employee";
import { type Department, type DepartmentFormData } from "../types/department";
import { type TrainingFormData } from "../types/training";

interface WelcomeSectionProps {
    departments: Department[];
    onRefreshDashboard?: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
    departments = [],
    onRefreshDashboard,
}) => {
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [showAddTraining, setShowAddTraining] = useState(false);
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const { toasts, addToast, removeToast } = useToast();

    // Employee handler - returns Promise<void>
    const handleSaveEmployee = async (
        employeeData: EmployeeFormData
    ): Promise<void> => {
        try {
            await apiService.createEmployee({
                ...employeeData,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            setShowAddEmployee(false);
            addToast("Employee added successfully!", "success");
            onRefreshDashboard?.();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to add employee";
            addToast(message, "error");
            throw error; // Re-throw so the popup can handle validation
        }
    };

    // Training handler - returns Promise<void>
    const handleSaveTraining = async (
        trainingData: TrainingFormData
    ): Promise<void> => {
        try {
            await apiService.createTraining({
                ...trainingData,
                duration_hours: Number(trainingData.duration_hours),
            });

            setShowAddTraining(false);
            addToast("Training program added successfully!", "success");
            onRefreshDashboard?.();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to add training program";
            addToast(message, "error");
            throw error; // Re-throw so the popup can handle validation
        }
    };

    // Department handler - returns Promise<void>
    const handleSaveDepartment = async (
        departmentData: DepartmentFormData
    ): Promise<void> => {
        try {
            await apiService.createDepartment({
                ...departmentData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            setShowAddDepartment(false);
            addToast("Department added successfully!", "success");
            onRefreshDashboard?.();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to add department";
            addToast(message, "error");
            throw error; // Re-throw so the popup can handle validation
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

            {/* Popups - handlers now return Promise<void> */}
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

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default WelcomeSection;
