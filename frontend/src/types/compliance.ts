// types/compliance.ts
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
    departmentCompliance: Array<{
        department: string;
        complianceRate: number;
        totalEmployees: number;
        compliantEmployees: number;
    }>;
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
        // snake_case
        start: string;
        end: string;
    };
    compliance_threshold: number; // snake_case
    include_expired: boolean; // snake_case
    include_expiring_soon: boolean; // snake_case
    certification_type: string; // snake_case
}
