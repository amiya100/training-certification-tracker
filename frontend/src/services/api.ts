// api.ts - Updated with token validation method
import { type Employee, type EmployeeListResponse } from "../types/employee";
import {
    type Training,
    type TrainingFormData,
    type TrainingListResponse,
} from "../types/training";
import { type Enrollment, type EnrollmentFormData } from "../types/enrollment";
import { type Certification } from "../types/certification";
import {
    type Department,
    type DepartmentFormData,
    type DepartmentListResponses,
} from "../types/department";
import {
    type ReportFilters,
    type ComplianceMetrics,
} from "../types/compliance";

const API_BASE = "http://localhost:8000";

interface TokenValidationResponse {
    valid: boolean;
    expires_at?: string;
    message?: string;
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

    // Token Validation
    async validateToken(): Promise<TokenValidationResponse> {
        try {
            return await this.fetchWithError<TokenValidationResponse>(
                "/auth/validate",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Include your authorization header if needed
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
        } catch (error) {
            console.error("Token validation error:", error);
            // Return invalid if there's an error (network issue, server down, etc.)
            return {
                valid: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Token validation failed",
            };
        }
    }

    // Dashboard stats
    async getDashboardData() {
        return this.fetchWithError<any>("/api/dashboard/dashboard-data");
    }

    // Employees
    async getEmployees(): Promise<Employee[]> {
        const data = await this.fetchWithError<EmployeeListResponse>(
            "/employees"
        );
        return data.employees || [];
    }

    async getEmployeeById(id: number): Promise<Employee> {
        return this.fetchWithError<Employee>(`/employees/${id}`);
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

    // Departments
    async getDepartments(): Promise<Department[]> {
        const data = await this.fetchWithError<DepartmentListResponses>(
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

    async updateDepartment(
        departmentData: DepartmentFormData & { id: number }
    ): Promise<Department> {
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

    // Trainings
    async getTrainings(): Promise<Training[]> {
        const data = await this.fetchWithError<TrainingListResponse>(
            "/trainings"
        );
        return data.trainings || [];
    }

    async getTrainingById(id: number): Promise<Training> {
        return this.fetchWithError<Training>(`/trainings/${id}`);
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
        enrollmentData: EnrollmentFormData
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

    async getCertificationById(id: number): Promise<Certification> {
        return this.fetchWithError<Certification>(`/certifications/${id}`);
    }

    // Compliance Report Methods
    async getComplianceReport(
        filters: ReportFilters
    ): Promise<ComplianceMetrics> {
        const response = await this.fetchWithError<ComplianceMetrics>(
            "/api/compliance/report",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            }
        );
        return response;
    }

    async exportComplianceReport(
        filters: ReportFilters,
        format: "pdf" | "excel"
    ): Promise<void> {
        const response = await fetch(
            `${API_BASE}/api/compliance/export/${format}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `compliance-report-${
            new Date().toISOString().split("T")[0]
        }`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            } else {
                // Use correct extension based on format
                filename = `${filename}.${format === "excel" ? "xlsx" : "pdf"}`;
            }
        } else {
            // Fallback with correct extension
            filename = `${filename}.${format === "excel" ? "xlsx" : "pdf"}`;
        }

        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

export const apiService = new ApiService();
