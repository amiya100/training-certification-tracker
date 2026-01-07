// ../types/employee.ts - Complete types file

export interface EmployeeFormData {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id: number | null; // Consistent with backend
    position: string;
    hire_date: string;
}

export interface Department {
    id: number;
    name: string;
}

export interface Employee extends EmployeeFormData {
    id: number; // Backend-generated primary key
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface EmployeesResponse {
    employees: Employee[];
    total: number;
}

export interface DepartmentsResponse {
    departments: Department[];
    total: number;
}

// Props for components
export interface AddEmployeePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: EmployeeFormData) => Promise<void>;
    departments: Department[];
}

export interface WelcomeSectionProps {
    onEmployeesUpdate?: (employees: Employee[]) => void;
}
