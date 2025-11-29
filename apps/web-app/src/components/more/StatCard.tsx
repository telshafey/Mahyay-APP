import React from 'react';
import GlassCard from '../GlassCard';

const StatCard: React.FC<{ icon: string; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <GlassCard className={`!bg-opacity-25 ${colorClass}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-black/20 text-3xl`}>{icon}</div>
            <div>
                <p className="text-white font-semibold text-lg">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
            </div>
        </div>
    </GlassCard>
);

export default React.memo(StatCard);