// types/dashboard.ts
export interface DashboardStats {
    total_employees: number;
    total_trainings: number;
    total_certifications: number;
    active_enrollments: number;
    total_departments: number;
    expiring_certifications: number;
    completion_rate: number;
    total_training_hours: number;
    employee_growth_percentage: number;
    enrollment_growth_percentage: number;
    certification_growth_percentage: number;
    expiring_change_percentage: number;
    completion_change_percentage: number;
    training_hours_growth_percentage: number;
    training_growth_percentage: number;
}

export interface StatusDistributionItem {
    label: string;
    count: number;
    percent: number;
    color: string;
}

export interface EmployeeStatus {
    totalEmployees: number;
    distribution: StatusDistributionItem[];
    topPerformer: {
        name: string;
        role: string;
        performance: number;
    };
}

export interface TrainingCertificationStatus {
    totalTrainings: number;
    certificationStatuses: StatusDistributionItem[];
    expiringSoonCount: number;
    expiringAvatars: string[];
    upcomingDeadlines: number;
}

export interface TrainingProgressItem {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    trainingName: string;
    progress: number;
    status: string;
    startDate?: string;
    endDate?: string;
    deadline?: string;
    completionDate?: string;
    hasCertification?: boolean;
}

export interface HRMetricItem {
    id: string;
    avatarUrl: string;
    name: string;
    role?: string;
    status?: string;
    statusColor?: string;
    departmentName?: string;
    trainingCount?: number;
    employeeCount?: number;
}

export interface HRMetrics {
    employees: HRMetricItem[];
    trainings: HRMetricItem[];
    departments: HRMetricItem[];
}

export interface DashboardData {
    stats: DashboardStats;
    employeeStatus: EmployeeStatus;
    trainingCertifications: TrainingCertificationStatus;
    trainingProgress: TrainingProgressItem[];
    hrMetrics: HRMetrics;
}
