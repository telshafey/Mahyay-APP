import React from 'react';
import { useParams } from 'react-router-dom';
import { MorePage as MorePageType } from '../types';

import StatsAndChallengesPage from './more/StatsAndChallengesPage';
import AboutPage from './more/AboutPage';
import SupportPage from './more/SupportPage';
import SettingsPage from './more/SettingsPage';
import GoalsPage from './more/GoalsPage';
import PrivacyPolicyPage from './more/PrivacyPolicyPage';
import TermsOfUsePage from './more/TermsOfUsePage';

const MorePage: React.FC = () => {
    const { page } = useParams<{ page: MorePageType }>();

    const availablePages: MorePageType[] = ['stats', 'challenges', 'about', 'support', 'settings', 'goals', 'privacy', 'terms'];
    const currentPage = page && availablePages.includes(page) ? page : 'stats';


    const pageComponents: Record<MorePageType, React.ComponentType> = {
        stats: StatsAndChallengesPage,
        challenges: StatsAndChallengesPage,
        about: AboutPage,
        support: SupportPage,
        settings: SettingsPage,
        goals: GoalsPage,
        privacy: PrivacyPolicyPage,
        terms: TermsOfUsePage,
    };

    const pageTitles: Record<MorePageType, string> = {
        stats: '📊 الإحصائيات والتحديات',
        challenges: '📊 الإحصائيات والتحديات',
        about: 'ℹ️ عن التطبيق',
        support: '🆘 الدعم والأسئلة الشائعة',
        settings: '⚙️ الإعدادات',
        goals: '🎯 أهدافي الشخصية',
        privacy: '🔒 سياسة الخصوصية',
        terms: '📜 شروط الاستخدام'
    }

    const CurrentPage = pageComponents[currentPage];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">{pageTitles[currentPage]}</h2>
            {CurrentPage ? <CurrentPage /> : <p className="text-center text-white">الصفحة غير موجودة</p>}
        </div>
    );
};

export default MorePage;
