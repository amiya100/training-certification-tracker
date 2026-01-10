// hr.ts
export interface HRItem {
    id: string;
    avatarUrl?: string;
    name: string;
    role?: string;
    status?: string;
    statusColor?: string;
    departmentName?: string;
    employeeCount?: number;
    trainingCount?: number;
}

export interface HRMetricsData {
    employees: HRItem[];
    trainings: HRItem[];
    departments: HRItem[];
}
