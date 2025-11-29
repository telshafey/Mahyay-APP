import React from 'react';
import { useAppContext } from '@mahyay/core';
import GlassCard from '../GlassCard';

const WeeklyPrayerChart: React.FC = () => {
    const { weeklyPrayerCounts } = useAppContext();
    const maxCount = 5; // Max 5 prayers

    return (
        <GlassCard>
            <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <span className="text-2xl">📊</span> صلوات الأسبوع الماضي
            </h4>
            <div className="flex justify-around items-end h-40 gap-2 p-2">
                {weeklyPrayerCounts.map((dayData, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="w-full h-full flex items-end justify-center group relative">
                             <div className="absolute -top-6 text-xs bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {dayData.count}
                            </div>
                            <div
                                className="w-4/5 bg-gradient-to-t from-yellow-400 to-amber-500 rounded-t-md transition-all duration-500 ease-out"
                                style={{ height: `${(dayData.count / maxCount) * 100}%` }}
                                title={`${dayData.day}: ${dayData.count} صلوات`}
                            ></div>
                        </div>
                        <span className="text-xs font-medium text-white mt-2">{dayData.day}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export default WeeklyPrayerChart;
