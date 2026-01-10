// components/Sidebar.tsx
import React from "react";
import logo from "../assets/logo.png";
import { type MenuItemType } from "../App";

interface SidebarProps {
    activeMenuItem: MenuItemType;
    onMenuItemClick: (item: MenuItemType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeMenuItem,
    onMenuItemClick,
}) => {
    const menuItems: { label: string; type: MenuItemType }[] = [
        { label: "Dashboard", type: "dashboard" },
        { label: "Departments", type: "departments" },
        { label: "Employees", type: "employees" },
        { label: "Trainings", type: "trainings" },
        { label: "Enrollments", type: "enrollments" },
        { label: "Certifications", type: "certifications" },
        { label: "Compliance Report", type: "complianceReport" },
    ];

    return (
        <aside className="w-64 bg-gradient-to-b from-transparent to-white/5 backdrop-blur-sm border-r border-white/20 shadow-2xl">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2 py-3 mb-8 rounded-xl">
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
                        {menuItems.map((item) => {
                            const isActive = activeMenuItem === item.type;
                            return (
                                <button
                                    key={item.type}
                                    onClick={() => onMenuItemClick(item.type)}
                                    className={`w-full text-left px-4 py-3 cursor-pointer rounded-xl transition-all duration-300 group ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-300 border-l-4 border-orange-500 shadow-lg"
                                            : "text-gray-300 hover:text-white hover:bg-gray-700/50 hover:shadow-lg hover:-translate-x-1 border-l-4 border-transparent"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium drop-shadow-lg">
                                                {item.label}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div className="w-2 h-2 bg-orange-500 rounded-full shadow-lg ring-2 ring-orange-500/50"></div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
