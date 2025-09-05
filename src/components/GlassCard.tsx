

import React from 'react';

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void; style?: React.CSSProperties }> = ({ children, className = '', onClick, style }) => {
    return (
        <div 
            className={`bg-black/20 border border-white/20 rounded-2xl shadow-lg p-4 md:p-6 ${className}`} 
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
};

export default GlassCard;