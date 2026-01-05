import React from "react";

const EmployeeChart: React.FC = () => {
    const departments = [
        { name: "UiUx", value: 85, color: "#F59E0B" },
        { name: "Development", value: 75, color: "#F59E0B" },
        { name: "Management", value: 60, color: "#F59E0B" },
        { name: "Testing", value: 30, color: "#F59E0B" },
        { name: "Marketing", value: 90, color: "#F59E0B" },
    ];

    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    Employees By Department
                </h3>
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    <span>This Week</span>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="6,9 12,15 18,9" />
                    </svg>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {departments.map((dept, index) => (
                    <div key={index} className="space-y-2 group">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-200 font-medium">
                                {dept.name}
                            </span>
                            <span className="text-gray-300 font-semibold">
                                {dept.value}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full h-2 border border-white/10">
                            <div
                                className="h-2 rounded-full transition-all duration-300 group-hover:shadow-lg group-hover:scale-y-110"
                                style={{
                                    width: `${dept.value}%`,
                                    backgroundColor: dept.color,
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeChart;
