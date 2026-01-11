// ComplianceReport.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";
import {
    type ReportFilters,
    type ComplianceMetrics,
} from "../types/compliance";
import { type Department } from "../types/department";

const ComplianceReport: React.FC = () => {
    const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingDepartments, setLoadingDepartments] = useState<boolean>(true);
    const [exporting, setExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<ReportFilters>({
        department: "all",
        date_range: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            end: new Date().toISOString().split("T")[0],
        },
    });

    const { toasts, addToast, removeToast } = useToast();

    // Fetch departments list
    const fetchDepartments = useCallback(async () => {
        try {
            setLoadingDepartments(true);
            const data = await apiService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Error fetching departments:", err);
            addToast("Failed to load departments list", "error");
        } finally {
            setLoadingDepartments(false);
        }
    }, [addToast]);

    // Fetch compliance data
    const fetchComplianceData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiService.getComplianceReport(filters);

            // Ensure arrays exist even if empty
            const processedData = {
                ...data,
                departmentCompliance: data.departmentCompliance || [],
                certificationStatus: data.certificationStatus || [],
                upcomingExpirations: data.upcomingExpirations || [],
                missingCertifications: data.missingCertifications || [],
            };

            setMetrics(processedData);
        } catch (err) {
            console.error("Error fetching compliance data:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            addToast("Failed to load compliance report", "error");
        } finally {
            setLoading(false);
        }
    }, [filters, addToast]);

    // Handlers
    const handleExportPDF = useCallback(async () => {
        try {
            setExporting(true);
            await apiService.exportComplianceReport(filters, "pdf");
            addToast("Report exported to PDF successfully", "success");
        } catch (err) {
            console.error("Error exporting PDF:", err);
            addToast("Failed to export PDF", "error");
        } finally {
            setExporting(false);
        }
    }, [filters, addToast]);

    const handleExportExcel = useCallback(async () => {
        try {
            setExporting(true);
            await apiService.exportComplianceReport(filters, "excel");
            addToast("Report exported to Excel successfully", "success");
        } catch (err) {
            console.error("Error exporting Excel:", err);
            addToast("Failed to export Excel", "error");
        } finally {
            setExporting(false);
        }
    }, [filters, addToast]);

    // Fetch departments on initial load
    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Fetch data on initial load and when filters change
    useEffect(() => {
        fetchComplianceData();
    }, [fetchComplianceData]);

    const derivedMetrics = useMemo(() => {
        if (!metrics) return null;

        return {
            riskLevel:
                metrics.overallComplianceRate >= 90
                    ? "Low"
                    : metrics.overallComplianceRate >= 70
                    ? "Medium"
                    : "High",
            expiringPercent:
                metrics.totalEmployees > 0
                    ? (metrics.expiringSoon / metrics.totalEmployees) * 100
                    : 0,
            nonCompliantPercent:
                metrics.totalEmployees > 0
                    ? (metrics.nonCompliantEmployees / metrics.totalEmployees) *
                      100
                    : 0,
        };
    }, [metrics]);

    // Loading skeleton for departments
    const DepartmentSelectSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-700/50 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-700/50 rounded-lg"></div>
        </div>
    );

    // Loading skeleton
    if (loading && !metrics) {
        return <ComplianceReportSkeleton />;
    }

    // Error state
    if (error && !metrics) {
        return (
            <div className="p-5">
                <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 backdrop-blur-sm border border-red-500/20 rounded-3xl p-8 shadow-2xl">
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
                            Failed to Load Compliance Report
                        </h3>
                        <p className="text-gray-300 mb-6 max-w-md mx-auto">
                            {error}
                        </p>
                        <button
                            onClick={fetchComplianceData}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-5 space-y-5">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Compliance Report
                            </h1>
                            <p className="text-gray-300 mt-1">
                                Track and monitor training and certification
                                compliance
                            </p>
                        </div>
                    </div>

                    {/* Filters Section - Only Department Filter */}
                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Department
                            </label>
                            {loadingDepartments ? (
                                <DepartmentSelectSkeleton />
                            ) : (
                                <select
                                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.department}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            department: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map((dept) => (
                                        <option
                                            key={dept.id}
                                            value={dept.name}
                                            className="text-black"
                                        >
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 backdrop-blur-sm border border-red-500/30 rounded-lg text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                            >
                                {exporting ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
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
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        Export PDF
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={exporting}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 backdrop-blur-sm border border-emerald-500/30 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
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
                                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                </svg>
                                Export Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics - Render metrics if available */}
                {metrics && derivedMetrics && (
                    <>
                        {/* Overall Compliance */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        Overall Compliance
                                    </h3>
                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            derivedMetrics.riskLevel === "Low"
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : derivedMetrics.riskLevel ===
                                                  "Medium"
                                                ? "bg-amber-500/20 text-amber-300"
                                                : "bg-red-500/20 text-red-300"
                                        }`}
                                    >
                                        {derivedMetrics.riskLevel} Risk
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="relative w-48 h-48">
                                        <svg
                                            className="w-full h-full"
                                            viewBox="0 0 100 100"
                                        >
                                            {/* Background circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="#374151"
                                                strokeWidth="10"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke={
                                                    metrics.overallComplianceRate >=
                                                    80
                                                        ? "#10B981"
                                                        : metrics.overallComplianceRate >=
                                                          60
                                                        ? "#F59E0B"
                                                        : "#EF4444"
                                                }
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeDasharray={`${
                                                    metrics.overallComplianceRate *
                                                    2.83
                                                } 283`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-bold text-white">
                                                {metrics.overallComplianceRate}%
                                            </span>
                                            <span className="text-gray-300 text-sm mt-1">
                                                Compliant
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {metrics.compliantEmployees}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            Compliant
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-300">
                                            {metrics.expiringSoon}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            Expiring Soon
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">
                                            {metrics.nonCompliantEmployees}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            Non-Compliant
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance by Department */}
                            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                                <h3 className="text-lg font-semibold text-white mb-6">
                                    Department Compliance
                                </h3>
                                {!metrics.departmentCompliance ||
                                metrics.departmentCompliance.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-6 h-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-gray-300">
                                            No department data available
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {metrics.departmentCompliance.map(
                                            (dept, index) => (
                                                <div
                                                    key={index}
                                                    className="space-y-2"
                                                >
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">
                                                            {dept.department}
                                                        </span>
                                                        <span className="text-white font-medium">
                                                            {
                                                                dept.complianceRate
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${dept.complianceRate}%`,
                                                                backgroundColor:
                                                                    dept.complianceRate >=
                                                                    90
                                                                        ? "#10B981"
                                                                        : dept.complianceRate >=
                                                                          70
                                                                        ? "#F59E0B"
                                                                        : "#EF4444",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-400">
                                                        <span>
                                                            {
                                                                dept.compliantEmployees
                                                            }
                                                            /
                                                            {
                                                                dept.totalEmployees
                                                            }{" "}
                                                            employees
                                                        </span>
                                                        <span>
                                                            {dept.complianceRate >=
                                                            80
                                                                ? "✓ Compliant"
                                                                : "✗ Non-Compliant"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Certification Status Grid */}
                        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-lg font-semibold text-white mb-6">
                                Certification Status
                            </h3>
                            {!metrics.certificationStatus ||
                            metrics.certificationStatus.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-6 h-6 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-gray-300">
                                        No certification data available
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {metrics.certificationStatus.map(
                                        (cert, index) => (
                                            <div
                                                key={index}
                                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-medium text-white truncate">
                                                        {cert.certification}
                                                    </h4>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${
                                                            cert.complianceRate >=
                                                            90
                                                                ? "bg-emerald-500/20 text-emerald-300"
                                                                : cert.complianceRate >=
                                                                  70
                                                                ? "bg-amber-500/20 text-amber-300"
                                                                : "bg-red-500/20 text-red-300"
                                                        }`}
                                                    >
                                                        {cert.complianceRate}%
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">
                                                            Valid
                                                        </span>
                                                        <span className="text-white">
                                                            {cert.valid}/
                                                            {cert.total}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-amber-300">
                                                            Expiring Soon
                                                        </span>
                                                        <span className="text-amber-300">
                                                            {cert.expiringSoon}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-red-400">
                                                            Expired
                                                        </span>
                                                        <span className="text-red-400">
                                                            {cert.expired}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Expirations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                                <h3 className="text-lg font-semibold text-white mb-6">
                                    Upcoming Expirations (Next 30 Days)
                                </h3>
                                {!metrics.upcomingExpirations ||
                                metrics.upcomingExpirations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-6 h-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-gray-300">
                                            No upcoming expirations
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto rounded-xl border border-white/10">
                                            <table className="min-w-full divide-y divide-white/10">
                                                <thead>
                                                    <tr className="bg-white/5">
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Employee
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Certification
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Days Left
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Department
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {metrics.upcomingExpirations
                                                        .slice(0, 5)
                                                        .map((item) => (
                                                            <tr
                                                                key={item.id}
                                                                className="hover:bg-white/5 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-white">
                                                                    {
                                                                        item.employeeName
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-300">
                                                                    {
                                                                        item.certificationName
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                            item.daysUntilExpiry <=
                                                                            7
                                                                                ? "bg-red-500/20 text-red-300"
                                                                                : "bg-amber-500/20 text-amber-300"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            item.daysUntilExpiry
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-300">
                                                                    {
                                                                        item.department
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {metrics.upcomingExpirations.length >
                                            5 && (
                                            <div className="mt-4 text-center">
                                                <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                    View all{" "}
                                                    {
                                                        metrics
                                                            .upcomingExpirations
                                                            .length
                                                    }{" "}
                                                    expirations →
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Missing Certifications */}
                            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                                <h3 className="text-lg font-semibold text-white mb-6">
                                    Missing Required Certifications
                                </h3>
                                {!metrics.missingCertifications ||
                                metrics.missingCertifications.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-6 h-6 text-gray-400"
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
                                        </div>
                                        <p className="text-gray-300">
                                            No missing certifications
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto rounded-xl border border-white/10">
                                            <table className="min-w-full divide-y divide-white/10">
                                                <thead>
                                                    <tr className="bg-white/5">
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Employee
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Required
                                                            Certification
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Department
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {metrics.missingCertifications
                                                        .slice(0, 5)
                                                        .map((item) => (
                                                            <tr
                                                                key={item.id}
                                                                className="hover:bg-white/5 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-white">
                                                                    {
                                                                        item.employeeName
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-300">
                                                                    {
                                                                        item.requiredCertification
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-300">
                                                                    {
                                                                        item.department
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                                                                        {item.daysOverdue >
                                                                        0
                                                                            ? `${item.daysOverdue} days overdue`
                                                                            : "Missing"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {metrics.missingCertifications.length >
                                            5 && (
                                            <div className="mt-4 text-center">
                                                <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                    View all{" "}
                                                    {
                                                        metrics
                                                            .missingCertifications
                                                            .length
                                                    }{" "}
                                                    missing →
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Training Completion */}
                        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-lg font-semibold text-white mb-6">
                                Training Completion Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white mb-2">
                                        {metrics.completedTrainings}
                                    </div>
                                    <div className="text-gray-300">
                                        Completed Trainings
                                    </div>
                                    <div className="text-sm text-emerald-400 mt-1">
                                        {metrics.totalTrainings > 0
                                            ? (
                                                  (metrics.completedTrainings /
                                                      metrics.totalTrainings) *
                                                  100
                                              ).toFixed(1) + "% completion rate"
                                            : "No trainings"}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-amber-300 mb-2">
                                        {metrics.pendingTrainings}
                                    </div>
                                    <div className="text-gray-300">
                                        Pending Trainings
                                    </div>
                                    <div className="text-sm text-amber-400 mt-1">
                                        {metrics.totalTrainings > 0
                                            ? (
                                                  (metrics.pendingTrainings /
                                                      metrics.totalTrainings) *
                                                  100
                                              ).toFixed(1) + "% pending"
                                            : "No trainings"}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white mb-2">
                                        {metrics.totalTrainings}
                                    </div>
                                    <div className="text-gray-300">
                                        Total Training Programs
                                    </div>
                                    <div className="text-sm text-blue-400 mt-1">
                                        {filters.department !== "all"
                                            ? `For ${filters.department} department`
                                            : "Active across all departments"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

// Loading Skeleton
const ComplianceReportSkeleton = () => (
    <div className="p-5 space-y-5">
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-2xl animate-pulse">
            <div className="h-10 bg-gray-700/50 rounded-xl w-1/4"></div>
            <div className="h-4 bg-gray-700/50 rounded-xl w-1/3 mt-2"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-12 bg-gray-700/50 rounded-lg"
                    ></div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded-xl w-1/3 mb-6"></div>
                <div className="h-48 bg-gray-700/50 rounded-full mx-auto"></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-16 bg-gray-700/50 rounded-xl"
                        ></div>
                    ))}
                </div>
            </div>
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded-xl w-1/3 mb-6"></div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-700/50 rounded-xl w-3/4"></div>
                            <div className="h-2 bg-gray-700/50 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default ComplianceReport;
