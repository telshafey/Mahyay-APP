import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader: React.FC<{ title: string; linkTo: string; }> = ({ title, linkTo }) => (
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xl font-semibold flex items-center gap-2">{title}</h3>
        <Link to={linkTo} className="text-sm bg-white/15 hover:bg-white/25 transition-colors text-white py-2 px-4 rounded-full">
            عرض الكل ←
        </Link>
    </div>
);

export default SectionHeader;
