import React from 'react';
import GlassCard from '../GlassCard';

interface PopularChallengesChartProps {
    title: string;
    data: { title: string; value: number }[];
}

const PopularChallengesChart: React.FC<PopularChallengesChartProps> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div 
                        key={item.title} 
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold text-white truncate">{item.title}</span>
                            <span className="font-bold text-yellow-300">{item.value}</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export default PopularChallengesChart;