import React from "react";

interface AttendanceOverviewProps {
    totalAttendance: number;
    statuses: Array<{
        label: string;
        percent: number;
        color: string;
    }>;
    totalAbsentees: number;
    absenteeAvatars: string[];
    periodLabel: string;
}

const AttendanceOverviewCard: React.FC<AttendanceOverviewProps> = ({
    totalAttendance,
    statuses,
    totalAbsentees,
    absenteeAvatars,
    periodLabel,
}) => {
    // Dynamic conic gradient based on actual status colors
    const totalPercent = statuses.reduce(
        (sum, status) => sum + status.percent,
        0
    );
    const conicStops = statuses
        .map((status, idx) => {
            const start =
                idx === 0
                    ? 0
                    : statuses
                          .slice(0, idx)
                          .reduce((sum, s) => sum + s.percent, 0);
            const end = start + status.percent;
            return `${status.color} ${start}% ${end}%`;
        })
        .join(", ");

    return (
        <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    Attendance Overview
                </h3>
                <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {periodLabel}
                </div>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-4">
                    {/* Semi-circle gauge background */}
                    <div className="absolute inset-0 w-full h-full rounded-full border-8 border-white/20"></div>
                    {/* Gauge segments - dynamic conic gradient */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(${conicStops})`,
                        }}
                    ></div>
                    {/* Center circle */}
                    <div className="absolute inset-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex flex-col items-center justify-center shadow-2xl border-2 border-white/20">
                        <span className="text-2xl font-bold text-white drop-shadow-lg">
                            {totalAttendance}
                        </span>
                        <span className="text-xs text-gray-300">
                            Total Attendance
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {statuses.map((status, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full shadow-lg border border-white/20"
                                style={{
                                    backgroundColor: status.color,
                                    boxShadow: `0 0 8px ${status.color}40`,
                                }}
                            ></div>
                            <span className="font-medium text-sm text-white drop-shadow-lg">
                                {status.label}
                            </span>
                        </div>
                        <span className="font-semibold text-sm text-white drop-shadow-lg">
                            {status.percent}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/20 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-200">
                        Total Absentees
                    </span>
                    <span className="text-lg font-bold text-red-400 drop-shadow-lg">
                        {totalAbsentees}
                    </span>
                </div>
                <div className="flex -space-x-2 mb-4">
                    {Array.from({
                        length: Math.min(absenteeAvatars.length, 4),
                    }).map((_, idx) => (
                        <img
                            key={idx}
                            src={absenteeAvatars[idx]}
                            alt="Absentee"
                            className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg ring-2 ring-red-500/50"
                        />
                    ))}
                    {totalAbsentees > 4 && (
                        <div className="w-8 h-8 bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-gray-300 border-2 border-white/30 shadow-lg ring-2 ring-red-500/50">
                            +{totalAbsentees - 4}
                        </div>
                    )}
                </div>
                <button className="w-full py-3 px-4 bg-gray-700 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    View Details
                </button>
            </div>
        </div>
    );
};

export default AttendanceOverviewCard;
