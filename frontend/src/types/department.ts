// department.ts
export interface Department {
    id: number;
    name: string;
    description?: string;
}

export interface DepartmentFormData {
    name: string;
    description: string;
}
