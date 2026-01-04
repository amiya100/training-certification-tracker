import React from "react";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    isPositive,
    icon,
    bgColor,
}) => {
    return (
        <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
                <div
                    className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
                >
                    {icon}
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-gray-400 text-sm">{title}</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{value}</span>
                    <span
                        className={`text-sm flex items-center ${
                            isPositive ? "text-green-400" : "text-red-400"
                        }`}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mr-1"
                        >
                            {isPositive ? (
                                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                            ) : (
                                <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" />
                            )}
                        </svg>
                        {change}
                    </span>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                    View Details
                </button>
            </div>
        </div>
    );
};

const StatsGrid: React.FC = () => {
    const stats = [
        {
            title: "Attendance Overview",
            value: "120/154",
            change: "+2.1%",
            isPositive: true,
            bgColor: "bg-orange-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
        },
        {
            title: "Total No of Projects",
            value: "90/125",
            change: "-2.1%",
            isPositive: false,
            bgColor: "bg-blue-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
            ),
        },
        {
            title: "Total No of Clients",
            value: "69/86",
            change: "-11.2%",
            isPositive: false,
            bgColor: "bg-blue-400",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            title: "Total No of Tasks",
            value: "225/28",
            change: "+11.2%",
            isPositive: true,
            bgColor: "bg-pink-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                </svg>
            ),
        },
        {
            title: "Earnings",
            value: "$21445",
            change: "+10.2%",
            isPositive: true,
            bgColor: "bg-purple-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
        },
        {
            title: "Profit This Week",
            value: "$5,544",
            change: "+2.1%",
            isPositive: true,
            bgColor: "bg-red-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
            ),
        },
        {
            title: "Job Applicants",
            value: "98",
            change: "+2.1%",
            isPositive: true,
            bgColor: "bg-green-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
        {
            title: "New Hire",
            value: "45/48",
            change: "-11.2%",
            isPositive: false,
            bgColor: "bg-gray-500",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default StatsGrid;
