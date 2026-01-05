import React, { useState } from "react";

interface Employee {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    clockIn?: string;
    clockOut?: string;
    production?: string;
    isLate?: boolean;
    duration?: string;
}

interface ClockInOutProps {
    employees: Employee[];
    selectedDepartment: string;
    onDepartmentChange: (dept: string) => void;
    periodLabel: string;
}

const ClockInOutCard: React.FC<ClockInOutProps> = ({
    employees,
    selectedDepartment,
    onDepartmentChange,
    periodLabel,
}) => {
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(
        employees[0]?.id || null
    );

    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    Clock-In/Out
                </h3>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        {periodLabel}
                    </div>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        className="px-3 py-1.5 bg-gray-700 backdrop-blur-sm border border-white/20 text-sm text-gray-200 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    >
                        <option>All Departments</option>
                        <option>Engineering</option>
                        <option>Design</option>
                        <option>HR</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                {/* Active Employees */}
                {employees.map((employee) => (
                    <div key={employee.id} className="space-y-3">
                        {/* Main employee row */}
                        <div
                            className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm border border-white/20 rounded-xl cursor-pointer transition-all duration-300 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 group"
                            onClick={() =>
                                setExpandedEmployee(
                                    expandedEmployee === employee.id
                                        ? null
                                        : employee.id
                                )
                            }
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                                        <span className="text-white font-semibold text-sm drop-shadow-lg">
                                            {employee.name.charAt(0)}
                                        </span>
                                    </div>
                                    {employee.isLate && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full shadow-lg ring-2 ring-red-500/50"></div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm text-white truncate drop-shadow-lg">
                                        {employee.name}
                                    </p>
                                    <p className="text-xs text-gray-300">
                                        {employee.role}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                                        employee.isLate
                                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 backdrop-blur-sm"
                                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm"
                                    }`}
                                >
                                    {employee.duration || "09:15"}
                                </div>
                                <button className="p-2 bg-gray-700 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                    <svg
                                        className="w-4 h-4 text-gray-300"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Expanded details */}
                        {expandedEmployee === employee.id && (
                            <div className="space-y-2 pb-2 bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-md"></div>
                                    <span className="text-gray-200 font-medium">
                                        Clock In
                                    </span>
                                    <span className="ml-auto text-gray-300 font-mono">
                                        {employee.clockIn || "10:30 AM"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full shadow-md"></div>
                                    <span className="text-gray-200 font-medium">
                                        Clock Out
                                    </span>
                                    <span className="ml-auto text-gray-300 font-mono">
                                        {employee.clockOut || "09:45 AM"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-md"></div>
                                    <span className="text-gray-200 font-medium">
                                        Production
                                    </span>
                                    <span className="ml-auto text-gray-300 font-mono">
                                        {employee.production || "09:21 Hrs"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Late Employees Section */}
            {employees.some((e) => e.isLate) && (
                <div className="mt-6">
                    <div className="border-t border-white/20 pt-6">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            Late
                            <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg"></div>
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-red-500/30">
                                        <span className="text-white font-semibold text-sm drop-shadow-lg">
                                            AL
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white drop-shadow-lg">
                                            Andy Lewis
                                        </p>
                                        <p className="text-xs text-gray-300">
                                            Manager
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 shadow-md backdrop-blur-sm">
                                        30 Min
                                    </div>
                                    <div className="px-2.5 py-1.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/40 shadow-md backdrop-blur-sm">
                                        08 Min
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClockInOutCard;
