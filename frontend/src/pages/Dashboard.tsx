import React from "react";
import WelcomeSection from "../components/WelcomeSection";
import StatsGrid from "../components/StatsGrid";
import EmployeeChart from "../components/EmployeeChart";
import EmployeeStatusCard from "../components/EmployeeStatusCard";
import AttendanceOverviewCard from "../components/AttendanceOverviewCard";
import ClockInOutCard from "../components/ClockInOutCard";
import HRMetricsRow from "../components/HRMetricsRow";

const Dashboard: React.FC = () => {
    return (
        <div className="p-5 space-y-5">
            <WelcomeSection />

            {/* Stats Grid & Employee Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                <div className="xl:col-span-3 shadow-2xl rounded-3xl ">
                    <StatsGrid />
                </div>
                <div className="xl:col-span-1 shadow-2xl rounded-3xl ">
                    <EmployeeChart />
                </div>
            </div>

            {/* 3D Attendance Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <EmployeeStatusCard
                        totalEmployees={154}
                        distribution={[
                            {
                                label: "Fulltime",
                                count: 112,
                                percent: 73,
                                color: "#10B981",
                            },
                            {
                                label: "Contract",
                                count: 12,
                                percent: 8,
                                color: "#F59E0B",
                            },
                            {
                                label: "Probation",
                                count: 4,
                                percent: 3,
                                color: "#3B82F6",
                            },
                            {
                                label: "WFH",
                                count: 26,
                                percent: 17,
                                color: "#8B5CF6",
                            },
                        ]}
                        topPerformer={{
                            name: "Daniel Edil",
                            role: "Senior Developer",
                            performance: 99,
                        }}
                        periodLabel="This Week"
                    />
                </div>

                <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <AttendanceOverviewCard
                        totalAttendance={120}
                        statuses={[
                            { label: "Present", percent: 59, color: "#10B981" },
                            { label: "Late", percent: 21, color: "#F59E0B" },
                            {
                                label: "Permission",
                                percent: 2,
                                color: "#3B82F6",
                            },
                            { label: "Absent", percent: 18, color: "#EF4444" },
                        ]}
                        totalAbsentees={12}
                        absenteeAvatars={[
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
                            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
                        ]}
                        periodLabel="Today"
                    />
                </div>

                <div className="shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden group">
                    <ClockInOutCard
                        employees={[
                            {
                                id: "1",
                                name: "Daniel Martin",
                                role: "UI/UX Designer",
                                duration: "09:15",
                                clockIn: "09:00 AM",
                                clockOut: "06:00 PM",
                                production: "09:21 Hrs",
                            },
                            {
                                id: "2",
                                name: "Brian Villalobos",
                                role: "Frontend Developer",
                                duration: "08:45",
                                clockIn: "10:30 AM",
                                clockOut: "09:45 AM",
                                production: "09:21 Hrs",
                                isLate: true,
                            },
                        ]}
                        selectedDepartment="All Departments"
                        onDepartmentChange={() => {}}
                        periodLabel="Today"
                    />
                </div>
            </div>

            <HRMetricsRow
                jobApplicants={[
                    {
                        id: "1",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Brian Villalobos",
                        role: "Senior Developer",
                        status: "Applied",
                        statusColor:
                            "bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-1 rounded-full",
                    },
                    {
                        id: "2",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Anthony Lewis",
                        role: "UX Designer",
                        status: "Shortlisted",
                        statusColor:
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full",
                    },
                    {
                        id: "3",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Stacy Patton",
                        role: "Product Manager",
                        status: "Interview",
                        statusColor:
                            "bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-1 rounded-full",
                    },
                    {
                        id: "4",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Dory Doyle",
                        role: "Marketing Lead",
                        status: "Offer",
                        statusColor:
                            "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full",
                    },
                ]}
                employees={[
                    {
                        id: "5",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Anthony Lewis",
                        role: "Department Head",
                        status: "Active",
                        statusColor:
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full",
                    },
                    {
                        id: "6",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Brian Villalobos",
                        role: "Senior Developer",
                        status: "Active",
                        statusColor:
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full",
                    },
                    {
                        id: "7",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Stacy Patton",
                        role: "Product Manager",
                        status: "Active",
                        statusColor:
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full",
                    },
                    {
                        id: "8",
                        avatarUrl: "/api/placeholder/40/40",
                        name: "Anthony Martin",
                        role: "UI Designer",
                        status: "Active",
                        statusColor:
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full",
                    },
                ]}
                todos={["Add Holidays", "Chat with Client", "Management Call"]}
            />
        </div>
    );
};

export default Dashboard;
