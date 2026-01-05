import React from "react";
import { Settings, Bell } from "lucide-react";

const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border-b border-white/20 px-5 py-3 shadow-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white drop-shadow-lg">
                        HR Management Dashboard
                    </h2>
                    <p className="text-xs text-gray-300 mt-0.5">
                        Welcome to your workspace
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <button className="p-1.5 bg-gray-700 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group">
                            <Bell size={16} className="text-gray-200" />
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center shadow-lg ring-2 ring-blue-500/50 group-hover:scale-110 transition-transform duration-300 text-[10px]">
                                3
                            </span>
                        </button>
                        <button className="p-1.5 bg-gray-700 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                            <Settings size={16} className="text-gray-200" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="relative group">
                            <img
                                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white/30 shadow-lg ring-1 ring-emerald-500/50"></div>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-white drop-shadow-lg">
                                Alex Johnson
                            </p>
                            <p className="text-xs text-gray-300">Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
