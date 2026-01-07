import React from "react";

const WelcomeSection: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <img
                            src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                            alt="Adrian"
                            className="w-16 h-16 rounded-full border-3 border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white/30 shadow-lg ring-1 ring-emerald-500/50 flex items-center justify-center">
                            <svg
                                width="8"
                                height="8"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-white"
                            >
                                <polyline points="20,6 9,17 4,12" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white drop-shadow-lg">
                            Welcome Back, Adrian
                        </h2>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2.5 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-blue-700 transition-all duration-300">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="font-medium text-white text-sm">
                            Add Employee
                        </span>
                    </button>
                    <button className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="font-medium text-white text-sm">
                            Add Training Program
                        </span>
                    </button>
                    <button className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm border border-orange-500/30 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="font-medium text-white text-sm">
                            Assign employee
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSection;
