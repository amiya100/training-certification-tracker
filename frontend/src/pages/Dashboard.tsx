import React from "react";
import WelcomeSection from "../components/WelcomeSection";
import StatsGrid from "../components/StatsGrid";
import EmployeeChart from "../components/EmployeeChart";

const Dashboard: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span>Admin Dashboard</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Export</span>
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
                    </button>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                            />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>2025</span>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="18,15 12,9 6,15" />
                        </svg>
                    </div>
                </div>
            </div>

            <WelcomeSection />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                    <StatsGrid />
                </div>
                <div className="xl:col-span-1">
                    <EmployeeChart />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
