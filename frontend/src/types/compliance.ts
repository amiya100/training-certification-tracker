// types/compliance.ts

// Add DepartmentCompliance interface
export interface DepartmentCompliance {
    department: string;
    complianceRate: number;
    totalEmployees: number;
    compliantEmployees: number;
    completedTrainings: number;
    pendingTrainings: number;
    totalTrainings: number;
}

export interface ComplianceMetrics {
    totalEmployees: number;
    compliantEmployees: number;
    nonCompliantEmployees: number;
    expiringSoon: number;
    expiredCertifications: number;
    totalTrainings: number;
    completedTrainings: number;
    pendingTrainings: number;
    overallComplianceRate: number;
    departmentCompliance: DepartmentCompliance[]; // Use the interface here
    certificationStatus: Array<{
        certification: string;
        total: number;
        valid: number;
        expiringSoon: number;
        expired: number;
        complianceRate: number;
    }>;
    upcomingExpirations: Array<{
        id: number;
        employeeName: string;
        certificationName: string;
        expiryDate: string;
        daysUntilExpiry: number;
        department: string;
    }>;
    missingCertifications: Array<{
        id: number;
        employeeName: string;
        requiredCertification: string;
        department: string;
        daysOverdue: number;
    }>;
}

export interface ReportFilters {
    department: string;
    date_range: {
        start: string;
        end: string;
    };
}
