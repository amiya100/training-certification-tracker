// src/types/training.ts
export interface TrainingFormData {
    name: string;
    description: string;
    duration_hours: number | "";
}

export interface Training {
    id: number;
    name: string;
    description: string;
    duration_hours: number;
    created_at: string;
    updated_at: string;
}
