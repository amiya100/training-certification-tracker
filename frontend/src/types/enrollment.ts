// enrollment.ts
export interface Enrollment {
    id: number;
    employee_id: number;
    training_id: number;
    status: "enrolled" | "in_progress" | "completed" | "cancelled";
    progress: number;
    enrolled_date: string; // This was missing
    start_date: string | null;
    end_date: string | null;
    completed_date: string | null;
    created_at: string;
    updated_at: string;
    // Optional relationships (if your API includes them)
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        department?: {
            id: number;
            name: string;
        };
    };
    training?: {
        id: number;
        name: string;
        description: string;
        duration_hours: number;
    };
}

export interface EnrollmentFormData {
    employee_id: number | "";
    training_id: number | "";
    status: "enrolled" | "in_progress" | "completed" | "cancelled";
    progress?: number;
    start_date: string;
    end_date: string;
    // Note: enrolled_date, created_at, updated_at are set by the server
}

// For update operations
export interface EnrollmentUpdateData {
    employee_id?: number;
    training_id?: number;
    status?: "enrolled" | "in_progress" | "completed" | "cancelled";
    progress?: number;
    start_date?: string;
    end_date?: string;
    completed_date?: string | null;
}

export interface TrainingProgressItem {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    trainingName: string;
    progress?: number;
    status: "enrolled" | "in_progress" | "completed" | "cancelled" | "overdue";
    startDate?: string;
    endDate?: string;
    deadline?: string;
    completionDate?: string;
    hasCertification?: boolean;
}
