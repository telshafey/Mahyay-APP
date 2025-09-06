

import React from 'react';

// FIX: Added the 'id' prop to the component's props to allow it to be used for anchoring, resolving the TypeScript error in AzkarPage.tsx.
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void; style?: React.CSSProperties; id?: string }> = ({ children, className = '', onClick, style, id }) => {
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

export default GlassCard;