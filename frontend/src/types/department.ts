// types/department.ts
export interface Department {
    id: number;
    name: string;
    description?: string;
    total_employees: number;
    created_at?: string;
    updated_at?: string;
}

// For creating/updating - only what user can edit
export interface DepartmentFormData {
    name: string;
    description?: string;
}

// For API response
export interface DepartmentListResponses {
    departments: Department[];
    total: number;
    skip: number;
    limit: number;
}
