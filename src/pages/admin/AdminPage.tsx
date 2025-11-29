import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

// Import admin pages
import DashboardPage from './DashboardPage';
import UsersManagementPage from './UsersManagementPage';
import NotificationsPage from './NotificationsPage';
import GeneralSettingsPage from './GeneralSettingsPage';
import ChallengesManagementPage from './ChallengesManagementPage';
import OccasionsManagementPage from './OccasionsManagementPage';
import PrayerMethodsManagementPage from './PrayerMethodsManagementPage';
import PrayerLocationsManagementPage from './PrayerLocationsManagementPage';
import PrayersManagementPage from './PrayersManagementPage';
import AzkarManagementPage from './AzkarManagementPage';
import QuranManagementPage from './QuranManagementPage';
import FaqManagementPage from './FaqManagementPage';
import AdminMoreListPage from './AdminMoreListPage';


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
                <Route path="prayer-locations" element={<PrayerLocationsManagementPage />} />
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