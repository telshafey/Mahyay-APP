import React from 'react';
import { useAppContext, QURAN_TOTAL_PAGES } from '@mahyay/core';
import GlassCard from '../GlassCard';

const KhatmaProgressChart: React.FC = () => {
    const { stats } = useAppContext();
    const { pagesReadInCurrent, percentage } = stats.khatmaProgress;
    
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <GlassCard className="!bg-sky-500 !bg-opacity-20 flex flex-col items-center justify-center">
             <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <span className="text-2xl">📖</span> تقدم الختمة الحالية
            </h4>
            <div className="relative w-40 h-40">
                <svg
                    height="100%"
                    width="100%"
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="#00000033"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="url(#progressGradient)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.5s ease-out' }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
                </div>
            </div>
             <p className="mt-4 text-white text-lg font-bold">{pagesReadInCurrent} / {QURAN_TOTAL_PAGES}</p>
             <p className="text-sm text-white">صفحة</p>
        </GlassCard>
    );
};

export default KhatmaProgressChart;
