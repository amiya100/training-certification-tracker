// employee.ts
import { type Department } from "./department";

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

export interface EmployeeListResponse {
    employees: Employee[];
    total: number;
    skip: number;
    limit: number;
}
