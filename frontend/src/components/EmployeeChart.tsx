import React from "react";

const EmployeeChart: React.FC = () => {
    const departments = [
        { name: "UiUx", value: 85, color: "bg-orange-500" },
        { name: "Development", value: 75, color: "bg-orange-500" },
        { name: "Management", value: 60, color: "bg-orange-500" },
        { name: "HR", value: 45, color: "bg-orange-500" },
        { name: "Testing", value: 30, color: "bg-orange-500" },
        { name: "Marketing", value: 90, color: "bg-orange-500" },
    ];

    return (
        <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                    Employees By Department
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
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
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{dept.name}</span>
                            <span className="text-gray-400">{dept.value}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`${dept.color} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${dept.value}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-400">
                    No of Employees increased by{" "}
                    <span className="text-green-400 font-semibold">+20%</span>{" "}
                    from last Week
                </span>
            </div>
        </div>
    );
};

export default EmployeeChart;
