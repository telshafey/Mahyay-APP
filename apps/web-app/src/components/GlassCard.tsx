
import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
    id?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style, id }) => {
    return (
        <div 
            id={id}
            className={`bg-black/20 border border-white/20 rounded-2xl shadow-lg p-4 md:p-6 ${className}`} 
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
};

export default React.memo(GlassCard);
