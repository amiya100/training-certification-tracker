// components/ToastContainer.tsx
import React from "react";
import Toast, { type ToastType } from "./Toast";

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onRemove,
}) => {
    return (
        <div className="fixed top-0 right-0 z-[100] p-6 space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
