import React from "react";

interface BarChartProps {
    title: string;
    data: number[];
    color: string;
    className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
    title,
    data,
    color,
    className = "",
}) => (
    <div
        className={`bg-gradient-to-r from-transparent to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl ${className} transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]`}
    >
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
                {title}
            </h3>
            <select className="bg-gray-700 backdrop-blur-sm border border-white/20 text-sm text-gray-200 px-3 py-1.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last month</option>
            </select>
        </div>
        <div className="h-52 bg-gradient-to-br from-gray-700/30 to-gray-800/50 rounded-2xl p-6 flex items-end justify-around backdrop-blur-sm border border-white/20">
            {data.map((val, i) => (
                <div key={i} className="w-14 flex flex-col items-center group">
                    <div
                        className={`w-4 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm`}
                        style={{
                            height: `${Math.min(val, 100)}%`,
                            backgroundColor: color,
                        }}
                    />
                    <span className="text-xs text-gray-300 mt-2 font-mono">
                        {val}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export default BarChart;
