
import React from 'react';

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
    return (
        <div 
            className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-4 md:p-6 ${className}`} 
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default GlassCard;
