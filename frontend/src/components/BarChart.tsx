// components/BarChart.tsx
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
        className={`bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl ${className} border-l-4`}
    >
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                {title}
            </h3>
            <select className="bg-gray-700/50 text-sm px-3 py-1.5 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none transition-colors">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last month</option>
            </select>
        </div>
        <div className="h-52 bg-gradient-to-br from-gray-800/30 to-gray-900/50 rounded-xl p-6 flex items-end justify-around backdrop-blur-sm border border-gray-700/50">
            {data.map((val, i) => (
                <div key={i} className="w-14 flex flex-col items-center group">
                    <div
                        className={`w-4 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 ${color} hover:scale-110`}
                        style={{ height: `${Math.min(val, 100)}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-2 font-mono">
                        {val}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export default BarChart;
