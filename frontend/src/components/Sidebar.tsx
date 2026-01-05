import React from "react";
import logo from "../assets/logo-1.png";

const Sidebar: React.FC = () => {
    const menuItems = [
        { label: "Dashboard", active: true },
        { label: "Employees", active: false },
        { label: "Trainings", active: false },
        { label: "Certifications", active: false },
        { label: "Attendance", active: false },
        { label: "Leave", active: false },
        { label: "Payroll", active: false },
        { label: "Performance", active: false },
        { label: "Recruitment", active: false },
        { label: "Settings", active: false },
    ];

    return (
        <aside className="w-64 bg-gradient-to-b from-transparent to-white/5 backdrop-blur-sm border-r border-white/20 shadow-2xl">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2 py-3 mb-8 rounded-xl  ">
                    <img
                        src={logo}
                        alt="SkillFlow Logo Icon"
                        className="w-10 h-10 drop-shadow-lg"
                    />
                    <div className="text-2xl font-bold tracking-tight leading-none">
                        <span className="text-white drop-shadow-lg">Skill</span>
                        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                            Flow
                        </span>
                    </div>
                </div>

                <nav className="space-y-1">
                    <div className="mb-4 px-2">
                        <span className="text-xs text-gray-300 uppercase tracking-wider font-medium">
                            MAIN MENU
                        </span>
                    </div>

                    <div className="space-y-1">
                        {menuItems.map((item, index) => (
                            <div
                                key={index}
                                className={`px-4 py-3 cursor-pointer rounded-xl transition-all duration-300 group ${
                                    item.active
                                        ? "bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-300 border-l-4 border-orange-500 shadow-lg"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700/50 hover:shadow-lg hover:-translate-x-1 border-l-4 border-transparent"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium drop-shadow-lg">
                                        {item.label}
                                    </span>
                                    {item.active && (
                                        <div className="w-2 h-2 bg-orange-500 rounded-full shadow-lg ring-2 ring-orange-500/50"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
