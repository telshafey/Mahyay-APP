import React from 'react';

const Section: React.FC<{ title: string; icon?: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`p-4 bg-black/20 rounded-lg ${className}`}>
        <h4 className="text-xl font-bold mb-3 text-yellow-300 flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <span>{title}</span>
        </h4>
        <div className="text-white leading-relaxed space-y-2">
            {children}
        </div>
    </div>
);

export default Section;
