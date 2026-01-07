import React, { useState, useEffect } from "react";
import WelcomeSection from "../components/WelcomeSection";
import StatsGrid from "../components/StatsGrid";
import EmployeeStatusCard from "../components/EmployeeStatusCard";
import TrainingCertificationCard from "../components/TrainingCertificationCard";
import TrainingProgressCard from "../components/TrainingProgressCard";
import HRMetricsRow from "../components/HRMetricsRow";

// Define shared interfaces
interface DashboardData {
    // Stats data
    stats: {
        total_employees: number;
        total_departments: number;
        employee_growth_percentage: number;
        total_trainings: number;
        training_growth_percentage: number;
        active_enrollments: number;
        enrollment_growth_percentage: number;
        total_certifications: number;
        expiring_certifications: number;
        expiring_change_percentage: number;
        certification_growth_percentage: number;
        completion_rate: number;
        completion_change_percentage: number;
        total_training_hours: number;
        training_hours_growth_percentage: number;
    };

    // Employee status data
    employeeStatus: {
        totalEmployees: number;
        distribution: Array<{
            label: string;
            count: number;
            percent: number;
            color: string;
        }>;
        topPerformer: {
            name: string;
            role: string;
            performance: number;
        };
    };

    // Training certification data
    trainingCertifications: {
        totalTrainings: number;
        certificationStatuses: Array<{
            label: string;
            percent: number;
            color: string;
            count: number;
        }>;
        expiringSoonCount: number;
        expiringAvatars: string[];
        upcomingDeadlines: number;
    };

    // Training progress data
    trainingProgress: Array<{
        id: string;
        name: string;
        role: string;
        avatarUrl?: string;
        trainingName: string;
        progress?: number;
        status:
            | "enrolled"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "overdue";
        startDate?: string;
        endDate?: string;
        deadline?: string;
        completionDate?: string;
        hasCertification?: boolean;
    }>;

    // HR metrics data
    hrMetrics: {
        employees: Array<{
            id: string;
            avatarUrl?: string;
            name: string;
            role?: string;
            status?: string;
            statusColor?: string;
            departmentName?: string;
        }>;
        trainings: Array<{
            id: string;
            avatarUrl?: string;
            name: string;
            role?: string;
            status?: string;
            statusColor?: string;
            trainingCount?: number;
        }>;
        departments: Array<{
            id: string;
            avatarUrl?: string;
            name: string;
            role?: string;
            status?: string;
            statusColor?: string;
            employeeCount?: number;
            trainingCount?: number;
        }>;
    };
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all dashboard data in one function
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch stats from dashboard endpoint
            const statsResponse = await fetch(
                "http://localhost:8000/api/dashboard/stats"
            );
            const statsData = await statsResponse.json();

            // 2. Fetch all other data in parallel
            const [
                employeesRes,
                trainingsRes,
                enrollmentsRes,
                certificationsRes,
            ] = await Promise.all([
                fetch("http://localhost:8000/employees"),
                fetch("http://localhost:8000/trainings"),
                fetch("http://localhost:8000/enrollments"),
                fetch("http://localhost:8000/certifications"),
            ]);

            const employeesData = await employeesRes.json();
            const trainingsData = await trainingsRes.json();
            const enrollmentsData = await enrollmentsRes.json();
            const certificationsData = await certificationsRes.json();

            // Process the raw data
            const processedData = processDashboardData(
                statsData,
                employeesData,
                trainingsData,
                enrollmentsData,
                certificationsData
            );

            setData(processedData);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Process all the raw data into the format needed by components
    const processDashboardData = (
        stats: any,
        employees: any,
        trainings: any,
        enrollments: any,
        certifications: any
    ): DashboardData => {
        // Extract arrays from API responses
        const employeeList = employees.employees || employees || [];
        const trainingList = trainings.trainings || trainings || [];
        const enrollmentList = enrollments.enrollments || enrollments || [];
        const certificationList =
            certifications.certifications || certifications || [];

        // Process employee status data
        const totalEmployees = employeeList.length;

        const employeeIdsWithTraining = new Set(
            enrollmentList
                .filter(
                    (e: any) =>
                        e.status === "in_progress" || e.status === "enrolled"
                )
                .map((e: any) => e.employee_id)
        );

        const employeeIdsCertified = new Set(
            certificationList
                .filter((c: any) => c.status === "active")
                .map((c: any) => c.employee_id)
        );

        const employeeIdsAvailable = new Set(
            employeeList
                .filter(
                    (emp: any) =>
                        !employeeIdsWithTraining.has(emp.id) &&
                        !employeeIdsCertified.has(emp.id)
                )
                .map((emp: any) => emp.id)
        );

        const distribution = [
            {
                label: "In Training",
                count: employeeIdsWithTraining.size,
                color: "#3B82F6",
            },
            {
                label: "Certified",
                count: employeeIdsCertified.size,
                color: "#10B981",
            },
            {
                label: "Available",
                count: employeeIdsAvailable.size,
                color: "#6B7280",
            },
            {
                label: "Completed",
                count: enrollmentList.filter(
                    (e: any) => e.status === "completed"
                ).length,
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
        certificationList.forEach((cert: any) => {
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

        employeeList.forEach((emp: any) => {
            const certCount = employeeCertCount[emp.id] || 0;
            if (certCount > maxCerts) {
                maxCerts = certCount;
                topEmployeeId = emp.id;
            }
        });

        if (topEmployeeId) {
            const topEmployee = employeeList.find(
                (emp: any) => emp.id === topEmployeeId
            );
            const performance =
                trainingList.length > 0
                    ? Math.round((maxCerts / trainingList.length) * 100)
                    : 0;

            topPerformer = {
                name: `${topEmployee.first_name} ${topEmployee.last_name}`,
                role: topEmployee.position || "Employee",
                performance: Math.min(performance, 100),
            };
        }

        // Process training certification data
        const enrolledCount = enrollmentList.filter(
            (e: any) => e.status === "enrolled" || e.status === "in_progress"
        ).length;

        const certifiedCount = certificationList.filter(
            (c: any) => c.status === "active"
        ).length;

        const notStartedCount = Math.max(
            0,
            trainingList.length - enrolledCount - certifiedCount
        );
        const expiredCount = certificationList.filter(
            (c: any) => c.status === "expired"
        ).length;

        const certificationStatuses = [
            { label: "Certified", count: certifiedCount, color: "#10B981" },
            { label: "In Progress", count: enrolledCount, color: "#3B82F6" },
            { label: "Not Started", count: notStartedCount, color: "#6B7280" },
            { label: "Expired", count: expiredCount, color: "#EF4444" },
        ].map((status) => ({
            ...status,
            percent:
                trainingList.length > 0
                    ? Math.round((status.count / trainingList.length) * 100)
                    : 0,
        }));

        // Calculate expiring certifications
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const expiringSoonCount = certificationList.filter((cert: any) => {
            if (!cert.expiry_date || cert.status !== "active") return false;
            const expiryDate = new Date(cert.expiry_date);
            return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
        }).length;

        // Generate avatars for expiring certifications
        const expiringEmployeeIds = new Set(
            certificationList
                .filter((cert: any) => {
                    if (!cert.expiry_date || cert.status !== "active")
                        return false;
                    const expiryDate = new Date(cert.expiry_date);
                    return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
                })
                .map((cert: any) => cert.employee_id)
        );

        const expiringAvatars = Array.from(expiringEmployeeIds)
            .slice(0, 4)
            .map((employeeId: any) => {
                const employee = employeeList.find(
                    (emp: any) => emp.id === employeeId
                );
                if (employee) {
                    const initials = `${employee.first_name?.charAt(0) || "E"}${
                        employee.last_name?.charAt(0) || "m"
                    }`;
                    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        initials
                    )}&background=random&color=fff&size=40`;
                }
                return `https://ui-avatars.com/api/?name=User&background=random&color=fff&size=40`;
            });

        // Process training progress data
        const employeeMap = new Map<number, any>();
        employeeList.forEach((emp: any) => employeeMap.set(emp.id, emp));

        const trainingMap = new Map<number, any>();
        trainingList.forEach((train: any) => trainingMap.set(train.id, train));

        const certificationMap = new Map<string, boolean>();
        certificationList.forEach((cert: any) => {
            if (cert.status === "active") {
                const key = `${cert.employee_id}-${cert.training_id}`;
                certificationMap.set(key, true);
            }
        });

        const trainingProgress = enrollmentList
            .slice(0, 8)
            .map((enroll: any) => {
                const employee = employeeMap.get(enroll.employee_id);
                const training = trainingMap.get(enroll.training_id);

                let progress = enroll.progress || 0;
                let status: any = enroll.status || "enrolled";

                if (status === "completed") {
                    progress = 100;
                } else if (
                    status === "in_progress" &&
                    !enroll.progress &&
                    enroll.start_date &&
                    enroll.end_date
                ) {
                    const start = new Date(enroll.start_date).getTime();
                    const end = new Date(enroll.end_date).getTime();
                    const now = Date.now();
                    if (now >= end) {
                        progress = 100;
                    } else if (now > start) {
                        progress = Math.round(
                            ((now - start) / (end - start)) * 100
                        );
                    }
                }

                const isOverdue =
                    enroll.end_date &&
                    new Date(enroll.end_date) < new Date() &&
                    status !== "completed" &&
                    status !== "cancelled";

                const hasCertification = certificationMap.get(
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
                        training?.name || training?.title || "Unknown Training",
                    progress: Math.min(100, Math.max(0, progress)),
                    status: isOverdue ? "overdue" : status,
                    startDate: enroll.start_date
                        ? new Date(enroll.start_date)
                              .toISOString()
                              .split("T")[0]
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

        // Process HR metrics data
        // Employees for HR metrics
        const hrEmployees = employeeList.slice(0, 4).map((emp: any) => {
            const activeEnrollments = enrollmentList.filter(
                (enroll: any) =>
                    enroll.employee_id === emp.id &&
                    (enroll.status === "in_progress" ||
                        enroll.status === "enrolled")
            );

            const activeCertifications = certificationList.filter(
                (cert: any) =>
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
                departmentName: emp.department_id
                    ? `Dept ${emp.department_id}`
                    : "Unassigned",
            };
        });

        // Trainings for HR metrics
        const hrTrainings = trainingList.slice(0, 4).map((train: any) => {
            const trainingEnrollments = enrollmentList.filter(
                (enroll: any) => enroll.training_id === train.id
            );
            const inProgressCount = trainingEnrollments.filter(
                (enroll: any) =>
                    enroll.status === "in_progress" ||
                    enroll.status === "enrolled"
            ).length;

            let status = "Not Started";
            let statusColor =
                "bg-gray-500/20 text-gray-300 border border-gray-500/40 px-2 py-1 rounded-full";

            if (inProgressCount > 0) {
                status = `${inProgressCount} in progress`;
                statusColor =
                    "bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-1 rounded-full";
            }

            return {
                id: train.id.toString(),
                avatarUrl:
                    "https://ui-avatars.com/api/?name=TR&background=6366f1&color=fff&size=40",
                name: train.name || "Training Program",
                role: train.description
                    ? train.description.substring(0, 20) + "..."
                    : "Training",
                status,
                statusColor,
                trainingCount: trainingEnrollments.length,
            };
        });

        // Departments for HR metrics - Simplified version without department data
        const hrDepartments = [
            {
                id: "1",
                avatarUrl:
                    "https://ui-avatars.com/api/?name=IT&background=8b5cf6&color=fff&size=40",
                name: "IT Department",
                role: "Department",
                status: "24 employees",
                statusColor:
                    "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full",
                employeeCount: 24,
                trainingCount: 8,
            },
            {
                id: "2",
                avatarUrl:
                    "https://ui-avatars.com/api/?name=HR&background=8b5cf6&color=fff&size=40",
                name: "HR Department",
                role: "Department",
                status: "18 employees",
                statusColor:
                    "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full",
                employeeCount: 18,
                trainingCount: 6,
            },
            {
                id: "3",
                avatarUrl:
                    "https://ui-avatars.com/api/?name=SALES&background=8b5cf6&color=fff&size=40",
                name: "Sales Department",
                role: "Department",
                status: "32 employees",
                statusColor:
                    "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full",
                employeeCount: 32,
                trainingCount: 12,
            },
            {
                id: "4",
                avatarUrl:
                    "https://ui-avatars.com/api/?name=OPS&background=8b5cf6&color=fff&size=40",
                name: "Operations",
                role: "Department",
                status: "28 employees",
                statusColor:
                    "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full",
                employeeCount: 28,
                trainingCount: 10,
            },
        ];

        return {
            stats: stats,
            employeeStatus: {
                totalEmployees,
                distribution,
                topPerformer,
            },
            trainingCertifications: {
                totalTrainings: trainingList.length,
                certificationStatuses,
                expiringSoonCount,
                expiringAvatars,
                upcomingDeadlines: enrollmentList.filter((enroll: any) => {
                    if (!enroll.deadline) return false;
                    const deadline = new Date(enroll.deadline);
                    const sevenDaysFromNow = new Date();
                    sevenDaysFromNow.setDate(now.getDate() + 7);
                    return deadline >= now && deadline <= sevenDaysFromNow;
                }).length,
            },
            trainingProgress,
            hrMetrics: {
                employees: hrEmployees,
                trainings: hrTrainings,
                departments: hrDepartments,
            },
        };
    };

    useEffect(() => {
        fetchDashboardData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-5 space-y-5">
                <WelcomeSection />
                <div className="shadow-2xl rounded-3xl animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="h-40 bg-gray-700/50 rounded-3xl"
                            ></div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-96 bg-gray-700/50 rounded-3xl"
                        ></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-80 bg-gray-700/50 rounded-3xl"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-5">
                <WelcomeSection />
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Failed to Load Dashboard
                    </h3>
                    <p className="text-gray-300 mb-4">
                        {error || "No data available"}
                    </p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-5">
            <WelcomeSection />

            {/* Stats Grid - Full Width */}
            <div className="shadow-2xl rounded-3xl">
                <StatsGrid
                    statsData={data.stats}
                    loading={loading}
                    error={error}
                    onRetry={fetchDashboardData}
                />
            </div>

            {/* 3D Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Employee Status Card */}
                <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <EmployeeStatusCard
                        data={data.employeeStatus}
                        periodLabel="Current Status"
                        loading={loading}
                        error={error}
                        onRetry={fetchDashboardData}
                    />
                </div>

                {/* Training & Certification Card */}
                <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <TrainingCertificationCard
                        data={data.trainingCertifications}
                        periodLabel="This Month"
                        loading={loading}
                        error={error}
                        onViewDetails={() =>
                            console.log("Navigate to training details")
                        }
                        onRetry={fetchDashboardData}
                    />
                </div>

                {/* Training Progress Card */}
                <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <TrainingProgressCard
                        data={data.trainingProgress}
                        periodLabel="This Month"
                        loading={loading}
                        error={error}
                        onCreateEnrollment={() =>
                            console.log("Navigate to create enrollment")
                        }
                        onViewAll={() =>
                            console.log("Navigate to enrollments page")
                        }
                        onRetry={fetchDashboardData}
                    />
                </div>
            </div>

            {/* HR Metrics Row */}
            <HRMetricsRow
                data={data.hrMetrics}
                title="Training & Management"
                loading={loading}
                error={error}
                onViewAll={(type: string) => console.log(`View all ${type}`)}
                onRetry={fetchDashboardData}
            />
        </div>
    );
};

export default Dashboard;
