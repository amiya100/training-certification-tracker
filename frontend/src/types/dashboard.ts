// types/dashboard.ts
import { type EmployeeStatusData } from "./employee";
import { type TrainingCertificationData } from "./training";
import { type TrainingProgressItem } from "./enrollment";
import { type HRMetricsData } from "./hr";

/**
 * Main dashboard data interface that combines all dashboard components
 */
export interface DashboardData {
    /** Statistics card data */
    stats: DashboardStats;

    /** Employee status card data */
    employeeStatus: EmployeeStatusData;

    /** Training & certification card data */
    trainingCertifications: TrainingCertificationData;

    /** Training progress list data */
    trainingProgress: TrainingProgressItem[];

    /** HR metrics row data */
    hrMetrics: HRMetricsData;
}

export interface DashboardStats {
    // employees / departments
    total_employees: number;
    total_departments: number;
    employee_growth_percentage: number;

    // trainings (training programs)
    total_trainings: number;
    training_growth_percentage: number;

    // enrollments (employee assignments to trainings)
    active_enrollments: number;
    enrollment_growth_percentage: number;

    // certifications
    total_certifications: number;
    expiring_certifications: number;
    expiring_change_percentage: number;
    certification_growth_percentage: number;

    // completion rate
    completion_rate: number;
    completion_change_percentage: number;

    // training hours
    total_training_hours: number;
    training_hours_growth_percentage: number;
}
