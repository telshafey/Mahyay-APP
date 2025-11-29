import React from 'react';
import GlassCard from '../../components/GlassCard';

const QuranManagementPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">📖 إدارة القرآن</h2>
            <GlassCard>
                <div className="text-center text-white py-10">
                    <p className="text-2xl mb-4">🚧</p>
                    <h3 className="text-xl font-bold">قيد الإنشاء</h3>
                    <p className="text-white/80">هذه الصفحة قيد التطوير وستكون متاحة قريبًا.</p>
                </div>
            </GlassCard>
        </div>
    );
};

export default QuranManagementPage;
