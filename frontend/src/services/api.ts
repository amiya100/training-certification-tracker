// api.ts
import { type Employee } from "../types/employee";
import { type Training, type TrainingFormData } from "../types/training";
import { type Enrollment, type EnrollmentFormData } from "../types/enrollment";
import { type Certification } from "../types/certification";
import { type Department } from "../types/department";

const API_BASE = "http://localhost:8000";

// Add these interfaces for API responses
interface DepartmentListResponse {
    departments: Department[];
    total: number;
    skip: number;
    limit: number;
}

interface TrainingListResponse {
    trainings: Training[];
    total: number;
    skip: number;
    limit: number;
}

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
        // Handle 204 No Content (DELETE responses)
        if (response.status === 204) {
            // For DELETE requests, return nothing (void)
            return undefined as unknown as T;
        }
        return response.json();
    }

    // Dashboard stats
    async getDashboardData() {
        return this.fetchWithError<any>("/api/dashboard/dashboard-data");
    }

    // Employees
    async getEmployees(): Promise<Employee[]> {
        const data = await this.fetchWithError<
            { employees: Employee[] } | Employee[]
        >("/employees");
        return Array.isArray(data) ? data : data.employees || [];
    }

    async createEmployee(employeeData: any): Promise<Employee> {
        return this.fetchWithError("/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData),
        });
    }

    async updateEmployee(employeeData: Employee): Promise<Employee> {
        return this.fetchWithError<Employee>(`/employees/${employeeData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData),
        });
    }

    async deleteEmployee(employeeId: number): Promise<void> {
        await this.fetchWithError<void>(`/employees/${employeeId}`, {
            method: "DELETE",
        });
    }

    // Trainings
    async getTrainings(): Promise<Training[]> {
        const data = await this.fetchWithError<TrainingListResponse>(
            "/trainings"
        );
        return data.trainings || [];
    }

    async getTraining(trainingId: number): Promise<Training> {
        return this.fetchWithError<Training>(`/trainings/${trainingId}`);
    }

    async createTraining(trainingData: TrainingFormData): Promise<Training> {
        return this.fetchWithError<Training>("/trainings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trainingData),
        });
    }

    async updateTraining(
        trainingData: TrainingFormData & { id: number }
    ): Promise<Training> {
        // Remove id from the request body since it's in the URL
        const { id, ...updateData } = trainingData;
        return this.fetchWithError<Training>(`/trainings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });
    }

    async deleteTraining(trainingId: number): Promise<void> {
        await this.fetchWithError<void>(`/trainings/${trainingId}`, {
            method: "DELETE",
        });
    }

    // Enrollments
    // Add to api.ts
    async getEnrollments(): Promise<Enrollment[]> {
        const data = await this.fetchWithError<
            { enrollments: Enrollment[] } | Enrollment[]
        >("/enrollments");
        return Array.isArray(data) ? data : data.enrollments || [];
    }

    async createEnrollment(
        enrollmentData: EnrollmentFormData
    ): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>("/enrollments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enrollmentData),
        });
    }

    async updateEnrollment(
        enrollmentId: number,
        enrollmentData: any
    ): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>(`/enrollments/${enrollmentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enrollmentData),
        });
    }

    async updateEnrollmentProgress(
        enrollmentId: number,
        progress: number
    ): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>(
            `/enrollments/${enrollmentId}/progress?progress=${progress}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    async completeEnrollment(enrollmentId: number): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>(
            `/enrollments/${enrollmentId}/complete`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    async deleteEnrollment(enrollmentId: number): Promise<void> {
        await this.fetchWithError<void>(`/enrollments/${enrollmentId}`, {
            method: "DELETE",
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
        const data = await this.fetchWithError<DepartmentListResponse>(
            "/departments"
        );
        return data.departments || [];
    }

    async createDepartment(departmentData: any): Promise<Department> {
        const response = await this.fetchWithError<Department>("/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(departmentData),
        });
        return response;
    }

    async updateDepartment(departmentData: Department): Promise<Department> {
        return this.fetchWithError(`/departments/${departmentData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(departmentData),
        });
    }

    async deleteDepartment(departmentId: number) {
        return this.fetchWithError(`/departments/${departmentId}`, {
            method: "DELETE",
        });
    }
}

export const apiService = new ApiService();
