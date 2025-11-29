import React from 'react';
import GlassCard from '../components/GlassCard';

const CommunityPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">🤝 المجتمع</h2>
            
            <GlassCard>
                <div className="text-center text-white py-16">
                    <p className="text-5xl mb-4">✨</p>
                    <h3 className="text-2xl font-bold">قريبًا... مجتمع مَحيّاي!</h3>
                    <p className="text-white/80 mt-2 max-w-md mx-auto">
                        مكان لمشاركة إنجازاتك الروحية، وتشجيع الآخرين، والنمو معًا في رحلتنا الإيمانية.
                    </p>
                </div>
            </GlassCard>
        </div>
    );
};

export default CommunityPage;
