import React from 'react';
import GlassCard from '../GlassCard';

interface EngagementChartProps {
    title: string;
    data: { day: string; value: number }[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className="flex justify-around items-end h-64 gap-2 p-2 border-t border-b border-white/10">
                {data.map((item, index) => (
                    <div 
                        key={item.day} 
                        className="flex-1 flex flex-col items-center justify-end h-full animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="w-full h-full flex items-end justify-center group relative">
                            <div className="absolute -top-7 text-xs bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.value} صلاة
                            </div>
                            <div
                                className="w-4/5 bg-gradient-to-t from-teal-400 to-cyan-500 rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                                title={`${item.day}: ${item.value} صلاة`}
                            ></div>
                        </div>
                        <span className="text-xs font-medium text-white mt-2">{item.day}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export default EngagementChart;