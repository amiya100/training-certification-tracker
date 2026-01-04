import React from "react";

const WelcomeSection: React.FC = () => {
    return (
        <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                        src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                        alt="Adrian"
                        className="w-16 h-16 rounded-full"
                    />
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-semibold">
                                Welcome Back, Adrian
                            </h2>
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-gray-400">
                            You have{" "}
                            <span className="text-orange-primary font-semibold">
                                21
                            </span>{" "}
                            Pending Approvals &{" "}
                            <span className="text-orange-primary font-semibold">
                                14
                            </span>{" "}
                            Leave Requests
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add Project</span>
                    </button>
                    <button className="px-4 py-2 bg-orange-primary hover:bg-orange-600 rounded flex items-center space-x-2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add Requests</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSection;
