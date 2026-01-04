import React from "react";
import logo from "../assets/logo-1.png";

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-dark-sidebar border-r border-gray-700">
            <div className="p-4">
                <div className="flex items-center gap-2 px-6 py-2 rounded-md mb-4">
                    {/* Icon as Image */}
                    <img
                        src={logo}
                        alt="SkillFlow Logo Icon"
                        className="w-12 h-12"
                    />

                    {/* Text */}
                    <div className="text-[28px] font-bold tracking-tight leading-none">
                        <span className="text-white">Skill</span>
                        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Flow
                        </span>
                    </div>
                </div>

                <nav className="space-y-2">
                    <div className="mb-4">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                            MAIN MENU
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className=" space-y-1">
                            <div className="p-2 text-orange-primary bg-orange-primary/10 rounded border-l-2 border-orange-primary">
                                Admin Dashboard
                            </div>
                            <div className="p-2 text-gray-400 hover:text-white cursor-pointer">
                                Employee Dashboard
                            </div>
                            <div className="p-2 text-gray-400 hover:text-white cursor-pointer">
                                Deals Dashboard
                            </div>
                            <div className="p-2 text-gray-400 hover:text-white cursor-pointer">
                                Leads Dashboard
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
