// employee.ts

export interface Department {
    id: number;
    name: string;
    description?: string;
}

export interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id?: number | null;
    department?: Department;
    position?: string;
    hire_date?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface EmployeeFormData {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id?: number | null;
    position: string;
    hire_date: string;
}

export interface EmployeeStatusData {
    totalEmployees: number;
    distribution: Array<{
        label: string;
        count: number;
        percent: number;
        color: string;
    }>;
    topPerformer: TopPerformer;
}

export interface TopPerformer {
    name: string;
    role: string;
    performance: number;
    avatarUrl?: string;
}

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
