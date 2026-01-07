// components/Toast.tsx
import React, { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type,
    onClose,
    duration = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Allow fade-out animation
        }, duration);

        const interval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - 100 / (duration / 100)));
        }, 100);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeConfig = {
        success: {
            bgColor: "bg-gradient-to-r from-emerald-800 to-emerald-900",
            borderColor: "border-emerald-600",
            textColor: "text-white",
            iconColor: "text-emerald-200",
            iconBg: "bg-emerald-700",
            progressBar: "bg-emerald-400",
            icon: (
                <svg
                    className="w-5 h-5 text-emerald-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
            ),
        },
        error: {
            bgColor: "bg-gradient-to-r from-red-800 to-red-900",
            borderColor: "border-red-600",
            textColor: "text-white",
            iconColor: "text-red-200",
            iconBg: "bg-red-700",
            progressBar: "bg-red-400",
            icon: (
                <svg
                    className="w-5 h-5 text-red-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            ),
        },
        info: {
            bgColor: "bg-blue-900/40",
            borderColor: "border-blue-600/40",
            textColor: "text-blue-100",
            iconColor: "text-blue-300",
            iconBg: "bg-blue-800/50",
            progressBar: "bg-blue-500",
            icon: (
                <svg
                    className="w-5 h-5 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
            ),
        },
        warning: {
            bgColor: "bg-yellow-900/40",
            borderColor: "border-yellow-600/40",
            textColor: "text-yellow-100",
            iconColor: "text-yellow-300",
            iconBg: "bg-yellow-800/50",
            progressBar: "bg-yellow-500",
            icon: (
                <svg
                    className="w-5 h-5 text-yellow-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                </svg>
            ),
        },
    };

    const config = typeConfig[type];

    return (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in">
            <div
                className={`${config.bgColor} backdrop-blur-sm ${config.borderColor} border rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md transform transition-all duration-300 hover:scale-[1.02]`}
            >
                <div className="flex items-start space-x-3">
                    <div
                        className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 border ${config.borderColor}`}
                    >
                        {config.icon}
                    </div>
                    <div className="flex-1">
                        <p className={`font-medium ${config.textColor}`}>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-4 h-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1 bg-gray-800/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${config.progressBar}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Toast;
