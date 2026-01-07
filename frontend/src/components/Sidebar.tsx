import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const Sidebar: React.FC = () => {
    const menuItems = [
        { label: "Dashboard", path: "/" },
        { label: "Employees", path: "/employee" },
        { label: "Trainings", path: "/trainings" },
        { label: "Enrollments", path: "/enrollments" },
        { label: "Certifications", path: "/certifications" },
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
                        {menuItems.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-xl transition-all duration-300 group flex justify-between items-center ${
                                        isActive
                                            ? "bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-300 border-l-4 border-orange-500 shadow-lg"
                                            : "text-gray-300 hover:text-white hover:bg-gray-700/50 hover:shadow-lg hover:-translate-x-1 border-l-4 border-transparent"
                                    }`
                                }
                            >
                                <span className="font-medium drop-shadow-lg">
                                    {item.label}
                                </span>
                                {item.path === "/" && (
                                    <span className="w-2 h-2 bg-orange-500 rounded-full shadow-lg ring-2 ring-orange-500/50"></span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
