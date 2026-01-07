import React, { useState, useEffect } from "react";
import WelcomeSection from "../components/WelcomeSection";
import StatsGrid from "../components/StatsGrid";
import EmployeeStatusCard from "../components/EmployeeStatusCard";
import TrainingCertificationCard from "../components/TrainingCertificationCard";
import TrainingProgressCard from "../components/TrainingProgressCard";
import HRMetricsRow from "../components/HRMetricsRow";
import CreateEnrollmentPopup from "../components/CreateEnrollmentPopup";
import ToastContainer, {
    type ToastMessage,
} from "../components/ToastContainer";
import { type Department, type Employee } from "../types/employee";

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

// Define raw data interfaces
interface RawEmployee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_id: number | null;
    position: string;
    hire_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface RawTraining {
    id: number;
    name: string;
    description: string;
    duration: number;
    category: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface RawEnrollment {
    id: number;
    employee_id: number;
    training_id: number;
    status: string;
    progress: number;
    start_date: string;
    end_date: string;
    completed_date: string | null;
    created_at: string;
    updated_at: string;
}

interface RawCertification {
    id: number;
    employee_id: number;
    training_id: number;
    cert_number: string;
    issue_date: string;
    expiry_date: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Enrollment form data interface
interface EnrollmentFormData {
    employee_id: number | "";
    training_id: number | "";
    status: "enrolled" | "in_progress";
    start_date: string;
    end_date: string;
    progress?: number;
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<RawEmployee[]>([]);
    const [trainings, setTrainings] = useState<RawTraining[]>([]);
    const [enrollments, setEnrollments] = useState<RawEnrollment[]>([]);
    const [certifications, setCertifications] = useState<RawCertification[]>(
        []
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateEnrollment, setShowCreateEnrollment] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Helper function to add toast
    const addToast = (message: string, type: ToastMessage["type"]) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    // Helper function to remove toast
    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Fetch all dashboard data in one function
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                statsResponse,
                employeesRes,
                trainingsRes,
                enrollmentsRes,
                certificationsRes,
                departmentsRes,
            ] = await Promise.all([
                fetch("http://localhost:8000/api/dashboard/stats"),
                fetch("http://localhost:8000/employees"),
                fetch("http://localhost:8000/trainings"),
                fetch("http://localhost:8000/enrollments"),
                fetch("http://localhost:8000/certifications"),
                fetch("http://localhost:8000/departments"),
            ]);

            // Parse responses
            const statsData = await statsResponse.json();
            const employeesData = await employeesRes.json();
            const trainingsData = await trainingsRes.json();
            const enrollmentsData = await enrollmentsRes.json();
            const certificationsData = await certificationsRes.json();
            const departmentsData = await departmentsRes.json();

            // Extract arrays from API responses
            const employeeList = employeesData.employees || employeesData || [];
            const trainingList = trainingsData.trainings || trainingsData || [];
            const enrollmentList =
                enrollmentsData.enrollments || enrollmentsData || [];
            const certificationList =
                certificationsData.certifications || certificationsData || [];
            const departmentList =
                departmentsData.departments || departmentsData || [];

            // Store raw data in state
            setEmployees(employeeList);
            setTrainings(trainingList);
            setEnrollments(enrollmentList);
            setCertifications(certificationList);
            setDepartments(departmentList);

            // Process the raw data into dashboard format
            const processedData = processDashboardData(
                statsData,
                employeeList,
                trainingList,
                enrollmentList,
                certificationList,
                departmentList
            );

            setData(processedData);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Handle save enrollment
    const handleSaveEnrollment = async (enrollmentData: EnrollmentFormData) => {
        try {
            // Convert dates to ISO format
            const submitData = {
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
            };

            console.log("Submitting enrollment data:", submitData);

            const response = await fetch("http://localhost:8000/enrollments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to create enrollment: ${response.status} - ${errorText}`
                );
            }

            const result = await response.json();
            console.log("Enrollment created successfully:", result);

            setShowCreateEnrollment(false);
            addToast("Enrollment created successfully!", "success");
            fetchDashboardData();
        } catch (error) {
            console.error("Error creating enrollment:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create enrollment";
            addToast(errorMessage, "error");
            throw error;
        }
    };

    // Process all the raw data into the format needed by components
    const processDashboardData = (
        stats: any,
        employeeList: RawEmployee[],
        trainingList: RawTraining[],
        enrollmentList: RawEnrollment[],
        certificationList: RawCertification[],
        departmentList: Department[]
    ): DashboardData => {
        // Process employee status data
        const totalEmployees = employeeList.length;

        const employeeIdsWithTraining = new Set(
            enrollmentList
                .filter(
                    (e) => e.status === "in_progress" || e.status === "enrolled"
                )
                .map((e) => e.employee_id)
        );

        const employeeIdsCertified = new Set(
            certificationList
                .filter((c) => c.status === "active")
                .map((c) => c.employee_id)
        );

        const employeeIdsAvailable = new Set(
            employeeList
                .filter(
                    (emp) =>
                        !employeeIdsWithTraining.has(emp.id) &&
                        !employeeIdsCertified.has(emp.id)
                )
                .map((emp) => emp.id)
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
                count: enrollmentList.filter((e) => e.status === "completed")
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
        certificationList.forEach((cert) => {
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

        employeeList.forEach((emp) => {
            const certCount = employeeCertCount[emp.id] || 0;
            if (certCount > maxCerts) {
                maxCerts = certCount;
                topEmployeeId = emp.id;
            }
        });

        if (topEmployeeId) {
            const topEmployee = employeeList.find(
                (emp) => emp.id === topEmployeeId
            );
            const performance =
                trainingList.length > 0
                    ? Math.round((maxCerts / trainingList.length) * 100)
                    : 0;

            topPerformer = {
                name: `${topEmployee?.first_name || ""} ${
                    topEmployee?.last_name || ""
                }`,
                role: topEmployee?.position || "Employee",
                performance: Math.min(performance, 100),
            };
        }

        // Process training certification data
        const enrolledCount = enrollmentList.filter(
            (e) => e.status === "enrolled" || e.status === "in_progress"
        ).length;

        const certifiedCount = certificationList.filter(
            (c) => c.status === "active"
        ).length;

        const notStartedCount = Math.max(
            0,
            trainingList.length - enrolledCount - certifiedCount
        );
        const expiredCount = certificationList.filter(
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
                trainingList.length > 0
                    ? Math.round((status.count / trainingList.length) * 100)
                    : 0,
        }));

        // Calculate expiring certifications
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const expiringSoonCount = certificationList.filter((cert) => {
            if (!cert.expiry_date || cert.status !== "active") return false;
            const expiryDate = new Date(cert.expiry_date);
            return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
        }).length;

        // Generate avatars for expiring certifications
        const expiringEmployeeIds = new Set(
            certificationList
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
                const employee = employeeList.find(
                    (emp) => emp.id === employeeId
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
        const employeeMap = new Map<number, RawEmployee>();
        employeeList.forEach((emp) => employeeMap.set(emp.id, emp));

        const trainingMap = new Map<number, RawTraining>();
        trainingList.forEach((train) => trainingMap.set(train.id, train));

        const certificationMap = new Map<string, boolean>();
        certificationList.forEach((cert) => {
            if (cert.status === "active") {
                const key = `${cert.employee_id}-${cert.training_id}`;
                certificationMap.set(key, true);
            }
        });

        const trainingProgress = enrollmentList.slice(0, 8).map((enroll) => {
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

        // Process HR metrics data
        // Employees for HR metrics
        const hrEmployees = employeeList.slice(0, 4).map((emp) => {
            const activeEnrollments = enrollmentList.filter(
                (enroll) =>
                    enroll.employee_id === emp.id &&
                    (enroll.status === "in_progress" ||
                        enroll.status === "enrolled")
            );

            const activeCertifications = certificationList.filter(
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
                const department = departmentList.find(
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
        const hrTrainings = trainingList.slice(0, 4).map((train) => {
            const trainingEnrollments = enrollmentList.filter(
                (enroll) => enroll.training_id === train.id
            );

            return {
                id: train.id.toString(),
                avatarUrl:
                    "https://ui-avatars.com/api/?name=TR&background=6366f1&color=fff&size=40",
                name: train.name || "Training Program",
                role: train.description
                    ? train.description.substring(0, 20) + "..."
                    : "Training",
                trainingCount: trainingEnrollments.length,
            };
        });

        // Departments for HR metrics
        const hrDepartments = departmentList.slice(0, 4).map((dept) => {
            // Count employees in this department
            const employeeCount = employeeList.filter(
                (emp) => emp.department_id === dept.id
            ).length;

            // Count trainings assigned to this department
            const trainingCount = enrollmentList.filter((enroll) => {
                const employee = employeeList.find(
                    (emp) => emp.id === enroll.employee_id
                );
                return employee?.department_id === dept.id;
            }).length;

            // Generate avatar based on department name
            const deptInitials = dept.name
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();

            // Determine status based on employee count
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
                upcomingDeadlines: enrollmentList.filter((enroll) => {
                    if (!enroll.end_date) return false;
                    const deadline = new Date(enroll.end_date);
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
                <WelcomeSection
                    departments={departments}
                    onRefreshDashboard={fetchDashboardData}
                />
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
                <WelcomeSection
                    departments={departments}
                    onRefreshDashboard={fetchDashboardData}
                />
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
        <>
            <div className="p-5 space-y-5">
                <WelcomeSection
                    departments={departments}
                    onRefreshDashboard={fetchDashboardData}
                />

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
                                setShowCreateEnrollment(true)
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
                    onViewAll={(type: string) =>
                        console.log(`View all ${type}`)
                    }
                    onRetry={fetchDashboardData}
                />
            </div>

            {/* Create Enrollment Popup */}
            <CreateEnrollmentPopup
                isOpen={showCreateEnrollment}
                onClose={() => setShowCreateEnrollment(false)}
                onSave={handleSaveEnrollment}
                employees={employees.map((emp) => ({
                    id: emp.id,
                    name: `${emp.first_name} ${emp.last_name}`,
                    position: emp.position,
                    department: departments.find(
                        (d) => d.id === emp.department_id
                    )?.name,
                }))}
                trainings={trainings.map((train) => ({
                    id: train.id,
                    name: train.name,
                    description: train.description,
                    duration_hours: train.duration_hours || 0,
                }))}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default Dashboard;
