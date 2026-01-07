// dashboardProcessor.ts
import { type DashboardData } from "../types/dashboard";
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import {
    type Enrollment,
    type TrainingProgressItem,
} from "../types/enrollment";
import { type Certification } from "../types/certification";
import { type Department } from "../types/department";

export class DashboardProcessor {
    private employees: Employee[] = [];
    private trainings: Training[] = [];
    private enrollments: Enrollment[] = [];
    private certifications: Certification[] = [];
    private departments: Department[] = [];

    constructor(
        employees: Employee[],
        trainings: Training[],
        enrollments: Enrollment[],
        certifications: Certification[],
        departments: Department[]
    ) {
        this.employees = employees;
        this.trainings = trainings;
        this.enrollments = enrollments;
        this.certifications = certifications;
        this.departments = departments;
    }

    // Memoized calculations
    private employeeIdsWithTraining = new Set<number>();
    private employeeIdsCertified = new Set<number>();
    private certificationMap = new Map<string, boolean>();

    private initMaps() {
        // Calculate employee IDs with training
        this.enrollments.forEach((enroll) => {
            if (
                enroll.status === "in_progress" ||
                enroll.status === "enrolled"
            ) {
                this.employeeIdsWithTraining.add(enroll.employee_id);
            }
        });

        // Calculate certified employee IDs
        this.certifications.forEach((cert) => {
            if (cert.status === "active") {
                this.employeeIdsCertified.add(cert.employee_id);
                const key = `${cert.employee_id}-${cert.training_id}`;
                this.certificationMap.set(key, true);
            }
        });
    }

    processEmployeeStatus() {
        this.initMaps();

        const totalEmployees = this.employees.length;
        const employeeIdsAvailable = new Set(
            this.employees
                .filter(
                    (emp) =>
                        !this.employeeIdsWithTraining.has(emp.id) &&
                        !this.employeeIdsCertified.has(emp.id)
                )
                .map((emp) => emp.id)
        );

        const distribution = [
            {
                label: "In Training",
                count: this.employeeIdsWithTraining.size,
                color: "#3B82F6",
            },
            {
                label: "Certified",
                count: this.employeeIdsCertified.size,
                color: "#10B981",
            },
            {
                label: "Available",
                count: employeeIdsAvailable.size,
                color: "#6B7280",
            },
            {
                label: "Completed",
                count: this.enrollments.filter((e) => e.status === "completed")
                    .length,
                color: "#8B5CF6",
            },
        ].map((item) => ({
            ...item,
            percent:
                totalEmployees > 0
                    ? Math.round((item.count / totalEmployees) * 100)
                    : 0,
        }));

        // Find top performer
        const employeeCertCount: Record<number, number> = {};
        this.certifications.forEach((cert) => {
            if (cert.status === "active") {
                employeeCertCount[cert.employee_id] =
                    (employeeCertCount[cert.employee_id] || 0) + 1;
            }
        });

        let topPerformer = {
            name: "No top performer yet",
            role: "Assign employees to trainings",
            performance: 0,
        };

        let maxCerts = 0;
        let topEmployeeId: number | null = null;

        this.employees.forEach((emp) => {
            const certCount = employeeCertCount[emp.id] || 0;
            if (certCount > maxCerts) {
                maxCerts = certCount;
                topEmployeeId = emp.id;
            }
        });

        if (topEmployeeId) {
            const topEmployee = this.employees.find(
                (emp) => emp.id === topEmployeeId
            );
            const performance =
                this.trainings.length > 0
                    ? Math.round((maxCerts / this.trainings.length) * 100)
                    : 0;

            topPerformer = {
                name: `${topEmployee?.first_name || ""} ${
                    topEmployee?.last_name || ""
                }`,
                role: topEmployee?.position || "Employee",
                performance: Math.min(performance, 100),
            };
        }

        return { totalEmployees, distribution, topPerformer };
    }

    processTrainingCertifications() {
        const enrolledCount = this.enrollments.filter(
            (e) => e.status === "enrolled" || e.status === "in_progress"
        ).length;

        const certifiedCount = this.certifications.filter(
            (c) => c.status === "active"
        ).length;
        const notStartedCount = Math.max(
            0,
            this.trainings.length - enrolledCount - certifiedCount
        );
        const expiredCount = this.certifications.filter(
            (c) => c.status === "expired"
        ).length;

        const certificationStatuses = [
            { label: "Certified", count: certifiedCount, color: "#10B981" },
            { label: "In Progress", count: enrolledCount, color: "#3B82F6" },
            { label: "Not Started", count: notStartedCount, color: "#6B7280" },
            { label: "Expired", count: expiredCount, color: "#EF4444" },
        ].map((status) => ({
            ...status,
            percent:
                this.trainings.length > 0
                    ? Math.round((status.count / this.trainings.length) * 100)
                    : 0,
        }));

        // Calculate expiring certifications
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const expiringSoonCount = this.certifications.filter((cert) => {
            if (!cert.expiry_date || cert.status !== "active") return false;
            const expiryDate = new Date(cert.expiry_date);
            return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
        }).length;

        // Generate avatars for expiring certifications
        const expiringEmployeeIds = new Set(
            this.certifications
                .filter((cert) => {
                    if (!cert.expiry_date || cert.status !== "active")
                        return false;
                    const expiryDate = new Date(cert.expiry_date);
                    return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
                })
                .map((cert) => cert.employee_id)
        );

        const expiringAvatars = Array.from(expiringEmployeeIds)
            .slice(0, 4)
            .map((employeeId) => {
                const employee = this.employees.find(
                    (emp) => emp.id === employeeId
                );
                const initials = `${employee?.first_name?.charAt(0) || "E"}${
                    employee?.last_name?.charAt(0) || "m"
                }`;
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    initials
                )}&background=random&color=fff&size=40`;
            });

        return {
            totalTrainings: this.trainings.length,
            certificationStatuses,
            expiringSoonCount,
            expiringAvatars,
            upcomingDeadlines: this.enrollments.filter((enroll) => {
                if (!enroll.end_date) return false;
                const deadline = new Date(enroll.end_date);
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(now.getDate() + 7);
                return deadline >= now && deadline <= sevenDaysFromNow;
            }).length,
        };
    }

    processTrainingProgress(): TrainingProgressItem[] {
        const employeeMap = new Map(this.employees.map((emp) => [emp.id, emp]));
        const trainingMap = new Map(
            this.trainings.map((train) => [train.id, train])
        );

        return this.enrollments.slice(0, 8).map((enroll) => {
            const employee = employeeMap.get(enroll.employee_id);
            const training = trainingMap.get(enroll.training_id);

            const progress = enroll.progress || 0;
            let status: any = enroll.status || "enrolled";

            const isOverdue =
                enroll.end_date &&
                new Date(enroll.end_date) < new Date() &&
                status !== "completed" &&
                status !== "cancelled";

            const hasCertification = this.certificationMap.get(
                `${enroll.employee_id}-${enroll.training_id}`
            );

            return {
                id: enroll.id.toString(),
                name: employee
                    ? `${employee.first_name} ${employee.last_name}`
                    : "Unknown Employee",
                role: employee?.position || "Employee",
                avatarUrl: employee
                    ? `https://ui-avatars.com/api/?name=${employee.first_name?.charAt(
                          0
                      )}${employee.last_name?.charAt(
                          0
                      )}&background=random&color=fff&size=40`
                    : undefined,
                trainingName:
                    training?.name ||
                    training?.description ||
                    "Unknown Training",
                progress: Math.min(100, Math.max(0, progress)),
                status: isOverdue ? "overdue" : status,
                startDate: enroll.start_date
                    ? new Date(enroll.start_date).toISOString().split("T")[0]
                    : undefined,
                endDate: enroll.end_date
                    ? new Date(enroll.end_date).toISOString().split("T")[0]
                    : undefined,
                deadline: enroll.end_date
                    ? new Date(enroll.end_date).toISOString().split("T")[0]
                    : undefined,
                completionDate: enroll.completed_date
                    ? new Date(enroll.completed_date)
                          .toISOString()
                          .split("T")[0]
                    : undefined,
                hasCertification,
            };
        });
    }

    processHRMetrics() {
        // Employees for HR metrics
        const hrEmployees = this.employees.slice(0, 4).map((emp) => {
            const activeEnrollments = this.enrollments.filter(
                (enroll) =>
                    enroll.employee_id === emp.id &&
                    (enroll.status === "in_progress" ||
                        enroll.status === "enrolled")
            );

            const activeCertifications = this.certifications.filter(
                (cert) =>
                    cert.employee_id === emp.id && cert.status === "active"
            );

            let status = "Available";
            let statusColor =
                "bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-1 rounded-full";

            if (activeEnrollments.length > 0) {
                status = "In Training";
                statusColor =
                    "bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-1 rounded-full";
            } else if (activeCertifications.length > 0) {
                status = `${activeCertifications.length} Certified`;
                statusColor =
                    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full";
            }

            // Find department name
            let departmentName = "Unassigned";
            if (emp.department_id) {
                const department = this.departments.find(
                    (dept) => dept.id === emp.department_id
                );
                departmentName =
                    department?.name || `Dept ${emp.department_id}`;
            }

            return {
                id: emp.id.toString(),
                avatarUrl: `https://ui-avatars.com/api/?name=${
                    emp.first_name?.charAt(0) || "E"
                }${
                    emp.last_name?.charAt(0) || "m"
                }&background=random&color=fff&size=40`,
                name:
                    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
                    "Employee",
                role: emp.position || "Employee",
                status,
                statusColor,
                departmentName,
            };
        });

        // Trainings for HR metrics
        const hrTrainings = this.trainings.slice(0, 4).map((train) => {
            const trainingEnrollments = this.enrollments.filter(
                (enroll) => enroll.training_id === train.id
            );

            return {
                id: train.id.toString(),
                avatarUrl:
                    "https://ui-avatars.com/api/?name=TR&background=6366f1&color=fff&size=40",
                name: train.name || "Training Program",
                role: train.description || "Training",
                trainingCount: trainingEnrollments.length,
            };
        });

        // Departments for HR metrics
        const hrDepartments = this.departments.slice(0, 4).map((dept) => {
            const employeeCount = this.employees.filter(
                (emp) => emp.department_id === dept.id
            ).length;
            const trainingCount = this.enrollments.filter((enroll) => {
                const employee = this.employees.find(
                    (emp) => emp.id === enroll.employee_id
                );
                return employee?.department_id === dept.id;
            }).length;

            const deptInitials = dept.name
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();

            let status = `${employeeCount} employees`;
            let statusColor =
                "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full";

            if (employeeCount === 0) {
                status = "No employees";
                statusColor =
                    "bg-gray-500/20 text-gray-300 border border-gray-500/40 px-2 py-1 rounded-full";
            } else if (employeeCount > 30) {
                status = `${employeeCount} employees (Large)`;
                statusColor =
                    "bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-1 rounded-full";
            }

            return {
                id: dept.id.toString(),
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    deptInitials
                )}&background=8b5cf6&color=fff&size=40`,
                name: dept.name || "Unnamed Department",
                status,
                statusColor,
                employeeCount,
                trainingCount,
            };
        });

        return {
            employees: hrEmployees,
            trainings: hrTrainings,
            departments: hrDepartments,
        };
    }

    processAll(stats: any): DashboardData {
        return {
            stats,
            employeeStatus: this.processEmployeeStatus(),
            trainingCertifications: this.processTrainingCertifications(),
            trainingProgress: this.processTrainingProgress(),
            hrMetrics: this.processHRMetrics(),
        };
    }
}
