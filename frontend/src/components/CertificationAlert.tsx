// CertificationAlertCard.tsx
import React from "react";
import { Clock, AlertCircle, Calendar, UserCheck } from "lucide-react";
import type {
    CertificationAlertItem,
    CertificationAlertsResponse,
} from "../types/dashboard";

interface CertificationAlertCardProps {
    title?: string;
    alerts?: CertificationAlertsResponse; // Updated type
    loading?: boolean;
    error?: string | null;
    onViewAll?: () => void;
    onRenewCert?: (employeeId: string) => void;
    periodLabel?: string;
}

const CertificationAlertCard: React.FC<CertificationAlertCardProps> = ({
    title = "Certification Alerts",
    alerts = {
        total: 0,
        expired: [],
        expiring_soon: [],
        expiring_later: [],
        period_label: "30 Days Outlook",
    },
    loading = false,
    error = null,
    onViewAll,
    onRenewCert,
    periodLabel,
}) => {
    // Use pre-categorized alerts from backend
    const {
        expired: expiredAlerts,
        expiring_soon: expiringSoonAlerts,
        expiring_later: expiringLaterAlerts,
        period_label,
        total,
    } = alerts;

    // Use provided periodLabel or backend's default
    const displayPeriodLabel = periodLabel || period_label;

    // Format date to readable string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Get status badge style
    const getStatusBadge = (status: CertificationAlertItem["status"]) => {
        switch (status) {
            case "expired":
                return {
                    bg: "bg-red-500/20",
                    text: "text-red-400",
                    border: "border-red-500/40",
                    icon: <AlertCircle className="w-3 h-3" />,
                };
            case "expiring_soon":
                return {
                    bg: "bg-yellow-500/20",
                    text: "text-yellow-400",
                    border: "border-yellow-500/40",
                    icon: <Clock className="w-3 h-3" />,
                };
            case "expiring_later":
                return {
                    bg: "bg-blue-500/20",
                    text: "text-blue-400",
                    border: "border-blue-500/40",
                    icon: <Calendar className="w-3 h-3" />,
                };
        }
    };

    // Combine all alerts for display
    const allAlerts = [
        ...expiredAlerts,
        ...expiringSoonAlerts,
        ...expiringLaterAlerts,
    ];

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-gray-700/50 rounded"></div>
                    <div className="h-8 w-28 bg-gray-700/50 rounded-lg"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, idx) => (
                        <div
                            key={idx}
                            className="h-20 bg-gray-700/50 rounded-xl"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col">
                <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Failed to Load
                    </h3>
                    <p className="text-gray-300 mb-4">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg flex items-center gap-2">
                    {title}
                </h3>
                <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {displayPeriodLabel}
                </div>
            </div>

            {/* Summary Stats - using backend-categorized counts */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <div className="text-2xl font-bold text-red-400">
                        {expiredAlerts.length}
                    </div>
                    <div className="text-xs text-gray-300">Expired</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <div className="text-2xl font-bold text-yellow-400">
                        {expiringSoonAlerts.length}
                    </div>
                    <div className="text-xs text-gray-300">Expiring Soon</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-400">
                        {expiringLaterAlerts.length}
                    </div>
                    <div className="text-xs text-gray-300">Upcoming</div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                {allAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <UserCheck className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                        <p className="text-gray-400">No certification alerts</p>
                        <p className="text-sm text-gray-500">
                            All certifications are up to date
                        </p>
                    </div>
                ) : (
                    allAlerts.slice(0, 5).map((alert) => {
                        const statusStyle = getStatusBadge(alert.status);
                        return (
                            <div
                                key={alert.id}
                                className="group p-4 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-start gap-3">
                                    <img
                                        src={alert.avatarUrl}
                                        alt={alert.name}
                                        className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-semibold text-sm text-white truncate drop-shadow-lg">
                                                    {alert.name}
                                                </h4>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {alert.role} •{" "}
                                                    {alert.department}
                                                </p>
                                            </div>
                                            <div
                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                            >
                                                {statusStyle.icon}
                                                <span className="capitalize">
                                                    {alert.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 truncate mb-2">
                                            {alert.certificationName}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                Expires:{" "}
                                                {formatDate(alert.expiryDate)}
                                            </div>
                                            {onRenewCert &&
                                                alert.status === "expired" && (
                                                    <button
                                                        onClick={() =>
                                                            onRenewCert(
                                                                alert.id
                                                            )
                                                        }
                                                        className="px-3 py-1 text-xs bg-blue-600 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                                    >
                                                        Renew
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                        Showing {Math.min(allAlerts.length, 5)} of {total}{" "}
                        alerts
                    </span>
                    {onViewAll && allAlerts.length > 0 && (
                        <button
                            onClick={onViewAll}
                            className="px-4 py-2 bg-gray-700 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 hover:bg-gray-600"
                        >
                            View All Alerts
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificationAlertCard;
