import React, { useState } from 'react';
import GlassCard from '../GlassCard';

const LocationBanner: React.FC<{ message: string }> = ({ message }) => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;
    return (
        <GlassCard className="!bg-red-900/50 !border-red-400/50 flex items-center justify-between gap-4">
            <p className="text-white text-sm">
                <span className="font-bold">⚠️ تنبيه:</span> {message}
            </p>
            <button onClick={() => setIsVisible(false)} className="text-white font-bold text-xl">&times;</button>
        </GlassCard>
    );
}

export default LocationBanner;