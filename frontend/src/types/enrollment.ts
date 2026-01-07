// enrollment.ts
export interface Enrollment {
    id: number;
    employee_id: number;
    training_id: number;
    status: string;
    progress: number;
    start_date: string;
    end_date: string;
    completed_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface EnrollmentFormData {
    employee_id: number | "";
    training_id: number | "";
    status: "enrolled" | "in_progress";
    start_date: string;
    end_date: string;
    progress?: number;
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
