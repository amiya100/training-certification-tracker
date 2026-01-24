// api.ts - Updated with protected routes
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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface LoginResponse {
    access_token: string;
    token_type: string;
}

interface FetchOptions extends RequestInit {
    skipAuth?: boolean; // Optional flag to skip authentication for certain endpoints
}

class ApiService {
    private async fetchWithError<T>(
        url: string,
        options: FetchOptions = {},
    ): Promise<T> {
        // Destructure to separate custom options from fetch options
        const { skipAuth = false, ...fetchOptions } = options;

        // Prepare headers
        const headers: Record<string, string> = {
            ...((fetchOptions.headers as Record<string, string>) || {}),
        };

        // Add Authorization header if not skipping auth
        if (!skipAuth && this.isAuthenticated()) {
            const token = this.getToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        // Ensure Content-Type for POST/PUT requests if not already set
        if (
            ["POST", "PUT", "PATCH"].includes(fetchOptions.method || "") &&
            !headers["Content-Type"]
        ) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(`${API_BASE}${url}`, {
            ...fetchOptions,
            headers,
        });

        // Handle unauthorized access (401)
        if (response.status === 401) {
            // Clear invalid token
            this.logout();

            // Redirect to login if not already on login page
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }

            throw new Error("Authentication required. Please log in again.");
        }

        // Handle forbidden access (403)
        if (response.status === 403) {
            throw new Error(
                "You do not have permission to access this resource.",
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        // Handle 204 No Content (DELETE responses)
        if (response.status === 204) {
            return undefined as unknown as T;
        }

        // Handle empty responses
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return undefined as unknown as T;
        }

        return response.json();
    }

    // ================= AUTH METHODS =================

    // Login method - skipAuth is true since this doesn't require token
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await this.fetchWithError<LoginResponse>(
                "/auth/login",
                {
                    method: "POST",
                    skipAuth: true,
                    body: JSON.stringify({ email, password }),
                },
            );

            // Store token in localStorage
            if (response.access_token) {
                localStorage.setItem("token", response.access_token);
            }

            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Login failed: ${error.message}`);
            }
            throw new Error("Login failed: Unknown error");
        }
    }

    // Logout method
    logout(): void {
        localStorage.removeItem("token");
        // Optional: Notify backend about logout
        // this.fetchWithError("/auth/logout", { method: "POST" }).catch(() => {});
    }

    // Get current token
    getToken(): string | null {
        return localStorage.getItem("token");
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const token = localStorage.getItem("token");
        return !!token;
    }

    // ================= PROTECTED API METHODS =================

    // Dashboard stats (protected)
    async getDashboardData() {
        return this.fetchWithError<any>("/api/dashboard/dashboard-data");
    }

    // Employees (protected)
    async getEmployees(): Promise<Employee[]> {
        const data =
            await this.fetchWithError<EmployeeListResponse>("/employees");
        return data.employees || [];
    }

    async getEmployeeById(id: number): Promise<Employee> {
        return this.fetchWithError<Employee>(`/employees/${id}`);
    }

    async createEmployee(employeeData: any): Promise<Employee> {
        return this.fetchWithError("/employees", {
            method: "POST",
            body: JSON.stringify(employeeData),
        });
    }

    async updateEmployee(employeeData: Employee): Promise<Employee> {
        return this.fetchWithError<Employee>(`/employees/${employeeData.id}`, {
            method: "PUT",
            body: JSON.stringify(employeeData),
        });
    }

    async deleteEmployee(employeeId: number): Promise<void> {
        await this.fetchWithError<void>(`/employees/${employeeId}`, {
            method: "DELETE",
        });
    }

    // Departments (protected)
    async getDepartments(): Promise<Department[]> {
        const data =
            await this.fetchWithError<DepartmentListResponses>("/departments");
        return data.departments || [];
    }

    async createDepartment(departmentData: any): Promise<Department> {
        const response = await this.fetchWithError<Department>("/departments", {
            method: "POST",
            body: JSON.stringify(departmentData),
        });
        return response;
    }

    async updateDepartment(
        departmentData: DepartmentFormData & { id: number },
    ): Promise<Department> {
        return this.fetchWithError(`/departments/${departmentData.id}`, {
            method: "PUT",
            body: JSON.stringify(departmentData),
        });
    }

    async deleteDepartment(departmentId: number) {
        return this.fetchWithError(`/departments/${departmentId}`, {
            method: "DELETE",
        });
    }

    // Trainings (protected)
    async getTrainings(): Promise<Training[]> {
        const data =
            await this.fetchWithError<TrainingListResponse>("/trainings");
        return data.trainings || [];
    }

    async getTrainingById(id: number): Promise<Training> {
        return this.fetchWithError<Training>(`/trainings/${id}`);
    }

    async createTraining(trainingData: TrainingFormData): Promise<Training> {
        return this.fetchWithError<Training>("/trainings", {
            method: "POST",
            body: JSON.stringify(trainingData),
        });
    }

    async updateTraining(
        trainingData: TrainingFormData & { id: number },
    ): Promise<Training> {
        // Remove id from the request body since it's in the URL
        const { id, ...updateData } = trainingData;
        return this.fetchWithError<Training>(`/trainings/${id}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
        });
    }

    async deleteTraining(trainingId: number): Promise<void> {
        await this.fetchWithError<void>(`/trainings/${trainingId}`, {
            method: "DELETE",
        });
    }

    // Enrollments (protected)
    async getEnrollments(): Promise<Enrollment[]> {
        const data = await this.fetchWithError<
            { enrollments: Enrollment[] } | Enrollment[]
        >("/enrollments");
        return Array.isArray(data) ? data : data.enrollments || [];
    }

    async createEnrollment(
        enrollmentData: EnrollmentFormData,
    ): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>("/enrollments", {
            method: "POST",
            body: JSON.stringify(enrollmentData),
        });
    }

    async updateEnrollment(
        enrollmentId: number,
        enrollmentData: EnrollmentFormData,
    ): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>(`/enrollments/${enrollmentId}`, {
            method: "PUT",
            body: JSON.stringify(enrollmentData),
        });
    }

    async updateEnrollmentProgress(
        enrollmentId: number,
        progress: number,
    ): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>(
            `/enrollments/${enrollmentId}/progress?progress=${progress}`,
            {
                method: "PATCH",
            },
        );
    }

    async completeEnrollment(enrollmentId: number): Promise<Enrollment> {
        return this.fetchWithError<Enrollment>(
            `/enrollments/${enrollmentId}/complete`,
            {
                method: "POST",
            },
        );
    }

    async deleteEnrollment(enrollmentId: number): Promise<void> {
        await this.fetchWithError<void>(`/enrollments/${enrollmentId}`, {
            method: "DELETE",
        });
    }

    // Certifications (protected)
    async getCertifications(): Promise<Certification[]> {
        const data = await this.fetchWithError<
            { certifications: Certification[] } | Certification[]
        >("/certifications");
        return Array.isArray(data) ? data : data.certifications || [];
    }

    async getCertificationById(id: number): Promise<Certification> {
        return this.fetchWithError<Certification>(`/certifications/${id}`);
    }

    // Compliance Report Methods (protected)
    async getComplianceReport(
        filters: ReportFilters,
    ): Promise<ComplianceMetrics> {
        const response = await this.fetchWithError<ComplianceMetrics>(
            "/api/compliance/report",
            {
                method: "POST",
                body: JSON.stringify(filters),
            },
        );
        return response;
    }

    async exportComplianceReport(
        filters: ReportFilters,
        format: "pdf" | "excel",
    ): Promise<void> {
        const response = await fetch(
            `${API_BASE}/api/compliance/export/${format}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.getToken()}`,
                },
                body: JSON.stringify(filters),
            },
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
