import React from "react";
import { Search, Settings, Bell } from "lucide-react";

const Header: React.FC = () => {
    return (
        <header className="bg-dark-sidebar border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search in HRMS"
                                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-700 rounded relative">
                            <Bell size={18} />
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                3
                            </span>
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded">
                            <Settings size={18} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <img
                            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
