// useToast.ts
import { useState, useCallback } from "react";

export interface ToastMessage {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback(
        (message: string, type: ToastMessage["type"]) => {
            const id = Date.now().toString();
            setToasts((prev) => [...prev, { id, message, type }]);

            // Auto-remove toast after 5 seconds
            setTimeout(() => {
                removeToast(id);
            }, 5000);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};
