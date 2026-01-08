// Certifications.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import { type Certification } from "../types/certification";
import { type Employee } from "../types/employee";
import { type Training } from "../types/training";
import ToastContainer from "../components/ToastContainer";

const Certifications: React.FC = () => {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [filteredCertifications, setFilteredCertifications] = useState<
        Certification[]
    >([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [expiryFilter, setExpiryFilter] = useState<string>("all");
    const { toasts, addToast, removeToast } = useToast();

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [certificationsData, employeesData, trainingsData] =
                await Promise.all([
                    apiService.getCertifications(),
                    apiService.getEmployees(),
                    apiService.getTrainings(),
                ]);

            setCertifications(certificationsData);
            setEmployees(employeesData);
            setTrainings(trainingsData);
            setFilteredCertifications(certificationsData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load data"
            );
            addToast("Failed to load certification data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    // Handle search and filters
    useEffect(() => {
        let filtered = certifications;

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((cert) => cert.status === statusFilter);
        }

        // Apply expiry filter
        if (expiryFilter !== "all") {
            const today = new Date();
            filtered = filtered.filter((cert) => {
                const expiryDate = new Date(cert.expiry_date);
                const timeDiff = expiryDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                switch (expiryFilter) {
                    case "expired":
                        return expiryDate < today;
                    case "expiring_soon":
                        return daysDiff > 0 && daysDiff <= 30;
                    case "valid":
                        return daysDiff > 30;
                    default:
                        return true;
                }
            });
        }

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((certification) => {
                const employee = employees.find(
                    (e) => e.id === certification.employee_id
                );
                const training = trainings.find(
                    (t) => t.id === certification.training_id
                );

                return (
                    certification.cert_number
                        .toLowerCase()
                        .includes(searchLower) ||
                    employee?.first_name?.toLowerCase().includes(searchLower) ||
                    employee?.last_name?.toLowerCase().includes(searchLower) ||
                    employee?.email?.toLowerCase().includes(searchLower) ||
                    training?.name?.toLowerCase().includes(searchLower) ||
                    certification.status?.toLowerCase().includes(searchLower)
                );
            });
        }

        setFilteredCertifications(filtered);
    }, [
        searchTerm,
        statusFilter,
        expiryFilter,
        certifications,
        employees,
        trainings,
    ]);

    // Handle download certificate (placeholder)
    const handleDownloadCertificate = useCallback(
        async (certificationId: number) => {
            try {
                addToast("Certificate download started!", "info");
                // Implement actual download logic here
                console.log("Downloading certificate:", certificationId);
            } catch (error) {
                console.error("Error downloading certificate:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to download certificate";
                addToast(errorMessage, "error");
            }
        },
        [addToast]
    );

    // Handle view certificate (placeholder)
    const handleViewCertificate = useCallback(
        (certificationId: number) => {
            // Navigate to certificate view page or open modal
            console.log("Viewing certificate:", certificationId);
            addToast("Opening certificate view...", "info");
        },
        [addToast]
    );

    // Handle renew certificate (placeholder)
    const handleRenewCertificate = useCallback(
        async (certificationId: number) => {
            try {
                // Implement renew logic here
                console.log("Renewing certificate:", certificationId);
                addToast("Certificate renewal requested!", "info");
            } catch (error) {
                console.error("Error renewing certificate:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to renew certificate";
                addToast(errorMessage, "error");
            }
        },
        [addToast]
    );

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper functions
    const getEmployeeName = (employeeId: number) => {
        const employee = employees.find((e) => e.id === employeeId);
        return employee
            ? `${employee.first_name} ${employee.last_name}`
            : "Unknown Employee";
    };

    const getTrainingName = (trainingId: number) => {
        const training = trainings.find((t) => t.id === trainingId);
        return training ? training.name : "Unknown Training";
    };

    const getEmployeeDepartment = (employeeId: number) => {
        const employee = employees.find((e) => e.id === employeeId);
        return employee?.department?.name || "No Department";
    };

    const getCertificateStatus = (expiryDate: string, status: string) => {
        if (status === "revoked") return "revoked";

        const today = new Date();
        const expiry = new Date(expiryDate);

        if (expiry < today) return "expired";

        const timeDiff = expiry.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff <= 30) return "expiring_soon";
        return "valid";
    };

    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const timeDiff = expiry.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    // Loading state
    if (loading && certifications.length === 0) {
        return <CertificationsSkeleton />;
    }

    // Calculate stats
    const expiredCount = certifications.filter((cert) => {
        const expiryDate = new Date(cert.expiry_date);
        return expiryDate < new Date();
    }).length;

    const expiringSoonCount = certifications.filter((cert) => {
        const expiryDate = new Date(cert.expiry_date);
        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff > 0 && daysDiff <= 30;
    }).length;

    const validCount = certifications.filter((cert) => {
        const expiryDate = new Date(cert.expiry_date);
        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff > 30;
    }).length;

    const revokedCount = certifications.filter(
        (cert) => cert.status === "revoked"
    ).length;

    return (
        <>
            <div className="p-5 space-y-5">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Certifications
                            </h1>
                            <p className="text-gray-300 mt-1">
                                View and manage employee certifications
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search certifications..."
                                    className="pl-10 pr-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="revoked">Revoked</option>
                            </select>
                            <select
                                value={expiryFilter}
                                onChange={(e) =>
                                    setExpiryFilter(e.target.value)
                                }
                                className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="all">All Expiry</option>
                                <option value="valid">
                                    Valid (&gt; 30 days)
                                </option>
                                <option value="expiring_soon">
                                    Expiring Soon (≤ 30 days)
                                </option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && certifications.length === 0 && (
                    <ErrorState error={error} onRetry={fetchData} />
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Certifications"
                        value={certifications.length.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        }
                        bgColor="bg-amber-500"
                    />

                    <StatCard
                        title="Valid Certificates"
                        value={validCount.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                        bgColor="bg-emerald-500"
                    />

                    <StatCard
                        title="Expiring Soon"
                        value={expiringSoonCount.toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        }
                        bgColor="bg-orange-500"
                    />

                    <StatCard
                        title="Expired/Revoked"
                        value={(expiredCount + revokedCount).toString()}
                        icon={
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                        bgColor="bg-red-500"
                    />
                </div>

                {/* Certifications Table */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                    {filteredCertifications.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                No certifications found
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {searchTerm ||
                                statusFilter !== "all" ||
                                expiryFilter !== "all"
                                    ? "Try different search criteria"
                                    : "Certifications will appear here after completing enrollments"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-2xl border border-white/10">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead>
                                        <tr className="bg-white/5 backdrop-blur-sm">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Certificate Details
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Training Program
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Validity
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredCertifications.map(
                                            (certification) => {
                                                const status =
                                                    getCertificateStatus(
                                                        certification.expiry_date,
                                                        certification.status
                                                    );
                                                const daysUntilExpiry =
                                                    getDaysUntilExpiry(
                                                        certification.expiry_date
                                                    );

                                                return (
                                                    <tr
                                                        key={certification.id}
                                                        className="hover:bg-white/5 transition-colors duration-200 group"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${getCertificateColor(
                                                                        certification.id
                                                                    )}`}
                                                                >
                                                                    <span className="text-white font-bold">
                                                                        {certification.cert_number.slice(
                                                                            0,
                                                                            2
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white group-hover:text-amber-300 transition-colors">
                                                                        {
                                                                            certification.cert_number
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-300">
                                                                        Issued:{" "}
                                                                        {new Date(
                                                                            certification.issue_date
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        ID:{" "}
                                                                        {
                                                                            certification.id
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${getEmployeeColor(
                                                                        certification.employee_id
                                                                    )}`}
                                                                >
                                                                    <span className="text-white text-xs font-bold">
                                                                        {getEmployeeName(
                                                                            certification.employee_id
                                                                        ).charAt(
                                                                            0
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">
                                                                        {getEmployeeName(
                                                                            certification.employee_id
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-300">
                                                                        {getEmployeeDepartment(
                                                                            certification.employee_id
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center text-gray-300">
                                                                <div
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${getTrainingColor(
                                                                        certification.training_id
                                                                    )}`}
                                                                >
                                                                    <span className="text-white text-xs font-bold">
                                                                        {getTrainingName(
                                                                            certification.training_id
                                                                        ).charAt(
                                                                            0
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">
                                                                        {getTrainingName(
                                                                            certification.training_id
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-300">
                                                                        Completed
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-2">
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getCertificateStatusColor(
                                                                        status
                                                                    )}`}
                                                                >
                                                                    {status
                                                                        .replace(
                                                                            "_",
                                                                            " "
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                                <div className="text-sm">
                                                                    <div className="text-gray-300">
                                                                        <span className="text-gray-400">
                                                                            Expires:{" "}
                                                                        </span>
                                                                        {new Date(
                                                                            certification.expiry_date
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                    {status ===
                                                                        "expiring_soon" && (
                                                                        <div className="text-orange-300 text-xs mt-1">
                                                                            Expires
                                                                            in{" "}
                                                                            {
                                                                                daysUntilExpiry
                                                                            }{" "}
                                                                            days
                                                                        </div>
                                                                    )}
                                                                    {status ===
                                                                        "expired" && (
                                                                        <div className="text-red-300 text-xs mt-1">
                                                                            Expired{" "}
                                                                            {Math.abs(
                                                                                daysUntilExpiry
                                                                            )}{" "}
                                                                            days
                                                                            ago
                                                                        </div>
                                                                    )}
                                                                    {status ===
                                                                        "revoked" && (
                                                                        <div className="text-red-300 text-xs mt-1">
                                                                            Certificate
                                                                            revoked
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleViewCertificate(
                                                                            certification.id
                                                                        )
                                                                    }
                                                                    className="p-2 text-gray-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                                                    title="View Certificate"
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDownloadCertificate(
                                                                            certification.id
                                                                        )
                                                                    }
                                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                                                    title="Download Certificate"
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                                {(status ===
                                                                    "expiring_soon" ||
                                                                    status ===
                                                                        "expired") &&
                                                                    certification.status !==
                                                                        "revoked" && (
                                                                        <button
                                                                            onClick={() =>
                                                                                handleRenewCertificate(
                                                                                    certification.id
                                                                                )
                                                                            }
                                                                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                                                            title="Renew Certificate"
                                                                        >
                                                                            <svg
                                                                                className="w-5 h-5"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination/Info */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-white/10">
                                <div className="text-gray-300 text-sm mb-4 sm:mb-0">
                                    Showing{" "}
                                    <span className="font-semibold text-white">
                                        {filteredCertifications.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-white">
                                        {certifications.length}
                                    </span>{" "}
                                    certifications
                                </div>
                                <div className="flex gap-2">
                                    {(searchTerm ||
                                        statusFilter !== "all" ||
                                        expiryFilter !== "all") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setStatusFilter("all");
                                                setExpiryFilter("all");
                                            }}
                                            className="px-4 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

// Helper functions
const getCertificateColor = (certificationId: number): string => {
    const colors = [
        "bg-amber-500",
        "bg-yellow-500",
        "bg-amber-600",
        "bg-yellow-600",
        "bg-orange-500",
        "bg-orange-600",
        "bg-amber-400",
        "bg-yellow-400",
        "bg-orange-400",
        "bg-amber-700",
    ];
    const index = certificationId % colors.length;
    return colors[index];
};

const getEmployeeColor = (employeeId: number): string => {
    const colors = [
        "bg-blue-500",
        "bg-indigo-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-teal-500",
        "bg-cyan-500",
    ];
    const index = employeeId % colors.length;
    return colors[index];
};

const getTrainingColor = (trainingId: number): string => {
    const colors = [
        "bg-blue-600",
        "bg-indigo-600",
        "bg-purple-600",
        "bg-pink-600",
        "bg-red-600",
        "bg-orange-600",
        "bg-yellow-600",
        "bg-green-600",
        "bg-teal-600",
        "bg-cyan-600",
    ];
    const index = trainingId % colors.length;
    return colors[index];
};

const getCertificateStatusColor = (status: string): string => {
    switch (status) {
        case "valid":
            return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
        case "expiring_soon":
            return "bg-orange-500/20 text-orange-300 border border-orange-500/40";
        case "expired":
            return "bg-red-500/20 text-red-300 border border-red-500/40";
        case "revoked":
            return "bg-gray-500/20 text-gray-300 border border-gray-500/40";
        default:
            return "bg-gray-500/20 text-gray-300 border border-gray-500/40";
    }
};

// Loading Skeleton
const CertificationsSkeleton = () => (
    <div className="p-5 space-y-5">
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded-xl w-1/4"></div>
            <div className="h-4 bg-gray-700/50 rounded-xl w-1/3 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse"
                >
                    <div className="h-10 w-10 bg-gray-700/50 rounded-xl mb-4"></div>
                    <div className="h-6 bg-gray-700/50 rounded-xl w-1/2"></div>
                    <div className="h-8 bg-gray-700/50 rounded-xl w-1/3 mt-2"></div>
                </div>
            ))}
        </div>

        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse">
            <div className="space-y-4">
                <div className="h-10 bg-gray-700/50 rounded-xl"></div>
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-gray-700/50 rounded-xl"
                    ></div>
                ))}
            </div>
        </div>
    </div>
);

// Error State Component
interface ErrorStateProps {
    error: string | null;
    onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
    <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center">
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
                Failed to Load Certifications
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
                {error ||
                    "Unable to load certification data. Please check your connection and try again."}
            </p>
            <div className="flex justify-center space-x-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-sm border border-amber-500/30 rounded-lg text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                >
                    Retry
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    </div>
);

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => {
    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] group">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                >
                    {icon}
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
                <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                        {value}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Certifications;
