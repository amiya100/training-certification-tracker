// training.ts
export interface Training {
    id: number;
    name: string;
    description: string;
    duration_hours: number;
    category: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

//Creating training from form data
export interface TrainingFormData {
    name: string;
    description: string;
    duration_hours: number | "";
}

export interface TrainingCertificationData {
    totalTrainings: number;
    certificationStatuses: Array<{
        label: string;
        percent: number;
        color: string;
        count: number;
    }>;
    expiringSoonCount: number;
    expiringAvatars: string[];
    upcomingDeadlines: number;
}

//Get trainings api response
export interface TrainingListResponse {
    trainings: Training[];
    total: number;
    skip: number;
    limit: number;
}
