import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Import admin pages
import DashboardPage from './admin/DashboardPage';
import UsersManagementPage from './admin/UsersManagementPage';
import NotificationsPage from './admin/NotificationsPage';
import GeneralSettingsPage from './admin/GeneralSettingsPage';
import ChallengesManagementPage from './admin/ChallengesManagementPage';
import OccasionsManagementPage from './admin/OccasionsManagementPage';
import PrayerMethodsManagementPage from './admin/PrayerMethodsManagementPage';
import PrayersManagementPage from './admin/PrayersManagementPage';
import AzkarManagementPage from './admin/AzkarManagementPage';
import QuranManagementPage from './admin/QuranManagementPage';
import FaqManagementPage from './admin/FaqManagementPage';
import AdminMoreListPage from './admin/AdminMoreListPage';


const AdminPage: React.FC = () => {
    return (
        <AdminLayout>
            <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UsersManagementPage />} />
                <Route path="challenges" element={<ChallengesManagementPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="more" element={<AdminMoreListPage />} />
                
                {/* Routes that appear in "More" list */}
                <Route path="settings" element={<GeneralSettingsPage />} />
                <Route path="occasions" element={<OccasionsManagementPage />} />
                <Route path="prayer-methods" element={<PrayerMethodsManagementPage />} />
                <Route path="prayers" element={<PrayersManagementPage />} />
                <Route path="azkar" element={<AzkarManagementPage />} />
                <Route path="quran" element={<QuranManagementPage />} />
                <Route path="faq" element={<FaqManagementPage />} />
                
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </AdminLayout>
    );
};

export default AdminPage;
