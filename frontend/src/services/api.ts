// api.ts
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import { type Enrollment, type EnrollmentFormData } from "../types/enrollment";
import { type Certification } from "../types/certification";
import { type Department } from "../types/department";

const API_BASE = "http://localhost:8000";

class ApiService {
    private async fetchWithError<T>(
        url: string,
        options?: RequestInit
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${url}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        return response.json();
    }

    // Dashboard stats
    async getDashboardStats() {
        return this.fetchWithError<any>("/api/dashboard/stats");
    }

    // Employees
    async getEmployees(): Promise<Employee[]> {
        const data = await this.fetchWithError<
            { employees: Employee[] } | Employee[]
        >("/employees");
        return Array.isArray(data) ? data : data.employees || [];
    }

    async createEmployee(employeeData: any) {
        return this.fetchWithError("/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData),
        });
    }

    // Trainings
    async getTrainings(): Promise<Training[]> {
        const data = await this.fetchWithError<
            { trainings: Training[] } | Training[]
        >("/trainings");
        return Array.isArray(data) ? data : data.trainings || [];
    }

    async createTraining(trainingData: any) {
        return this.fetchWithError("/trainings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trainingData),
        });
    }

    // Enrollments
    async getEnrollments(): Promise<Enrollment[]> {
        const data = await this.fetchWithError<
            { enrollments: Enrollment[] } | Enrollment[]
        >("/enrollments");
        return Array.isArray(data) ? data : data.enrollments || [];
    }

    async createEnrollment(enrollmentData: EnrollmentFormData) {
        return this.fetchWithError("/enrollments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...enrollmentData,
                start_date: enrollmentData.start_date
                    ? new Date(enrollmentData.start_date).toISOString()
                    : null,
                end_date: enrollmentData.end_date
                    ? new Date(enrollmentData.end_date).toISOString()
                    : null,
                enrolled_date: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }),
        });
    }

    // Certifications
    async getCertifications(): Promise<Certification[]> {
        const data = await this.fetchWithError<
            { certifications: Certification[] } | Certification[]
        >("/certifications");
        return Array.isArray(data) ? data : data.certifications || [];
    }

    // Departments
    async getDepartments(): Promise<Department[]> {
        const data = await this.fetchWithError<
            { departments: Department[] } | Department[]
        >("/departments");
        return Array.isArray(data) ? data : data.departments || [];
    }

    async createDepartment(departmentData: any) {
        return this.fetchWithError("/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(departmentData),
        });
    }
}

export const apiService = new ApiService();
