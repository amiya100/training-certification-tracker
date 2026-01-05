import React from "react";

interface JobItem {
    id: string;
    avatarUrl: string;
    name: string;
    role: string;
    status: string;
    statusColor: string;
}

interface HRMetricsRowProps {
    jobApplicants: JobItem[];
    employees: JobItem[];
    todos: string[];
}

const HRMetricsRow: React.FC<HRMetricsRowProps> = ({
    jobApplicants,
    employees,
    todos,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Job Applicants Card */}
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Job Applicants
                    </h3>
                    <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        View
                    </div>
                </div>
                <div className="space-y-3 flex-1">
                    {jobApplicants.map((job) => (
                        <div
                            key={job.id}
                            className="flex items-center gap-3 p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <img
                                src={job.avatarUrl}
                                alt={job.name}
                                className="w-10 h-10 rounded-full ring-2 ring-white/30 shadow-lg"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-white truncate drop-shadow-lg">
                                    {job.name}
                                </p>
                                <p className="text-xs text-gray-300">
                                    {job.role}
                                </p>
                            </div>
                            <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${job.statusColor}`}
                            >
                                {job.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Employees Card */}
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Employees
                    </h3>
                    <div className="px-3 py-1 bg-gray-700 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        View
                    </div>
                </div>
                <div className="space-y-3 flex-1">
                    {employees.map((emp) => (
                        <div
                            key={emp.id}
                            className="flex items-center gap-3 p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="w-10 h-10 rounded-full ring-2 ring-white/30 shadow-lg"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-white truncate drop-shadow-lg">
                                    {emp.name}
                                </p>
                                <p className="text-xs text-gray-300">
                                    {emp.role}
                                </p>
                            </div>
                            <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${emp.statusColor}`}
                            >
                                {emp.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Todos Card */}
            <div className="bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] md:col-span-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                        Todos
                    </h3>
                    <div className="w-6 h-6 bg-orange-500 rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-white">3</span>
                    </div>
                </div>
                <div className="space-y-3 flex-1">
                    {todos.map((todo, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-5 h-5 bg-white/20 rounded-md flex-shrink-0 mt-0.5 border-2 border-white/30"></div>
                            <p className="text-sm text-gray-200 leading-relaxed flex-1">
                                {todo}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HRMetricsRow;
