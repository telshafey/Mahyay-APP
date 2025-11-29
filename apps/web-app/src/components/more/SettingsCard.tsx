import React from 'react';
import GlassCard from '../GlassCard';

const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <GlassCard>
        <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><span className="text-2xl">{icon}</span> {title}</h4>
        <div className="space-y-4">
            {children}
        </div>
    </GlassCard>
);

export default SettingsCard;