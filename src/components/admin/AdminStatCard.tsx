import React from 'react';
import GlassCard from '../GlassCard';

interface AdminStatCardProps {
    title: string;
    value: string | number;
    icon: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon }) => {
    return (
        <GlassCard>
            <div className="flex items-center gap-4">
                <div className="text-4xl p-4 bg-black/20 rounded-lg">{icon}</div>
                <div>
                    <h4 className="font-semibold text-white/90">{title}</h4>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
};

export default AdminStatCard;
