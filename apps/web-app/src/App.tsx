
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext, useAppData, AuthProvider, useAuthContext, PrayerTimesContext, PrayerTimesContextType, AppContextType, useAppContext } from '@mahyay/core';
import { usePrayerTimes } from './hooks/usePrayerTimes';

import NotificationToast from './components/NotificationToast';
import AdminLayout from './layouts/AdminLayout';
import UserAppLayout from './layouts/UserAppLayout';

// Statically import page components.
import HomePage from './pages/HomePage';
import PrayersPage from './pages/PrayersPage';
import AzkarPage from './pages/AzkarPage';
import QuranPage from './pages/QuranPage';
import MoreListPage from './pages/MoreListPage';
import MorePage from './pages/MorePage';
import ChallengesPage from './pages/ChallengesPage';
import CommunityPage from './pages/CommunityPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/admin/AdminPage';

const LoadingScreen: React.FC = () => (
    <div className="h-screen flex flex-col justify-center items-center text-white bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47]">
        <h1 className="font-amiri text-4xl mb-4 animate-pulse">مَحيّاي</h1>
        <p>جاري التحميل...</p>
    </div>
);

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
    <div className="h-screen flex flex-col justify-center items-center text-center text-white bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] p-4">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="font-amiri text-3xl mb-2">حدث خطأ أثناء تحميل التطبيق</h1>
        <p className="bg-red-900/50 p-3 rounded-lg text-red-300 max-w-md">{message}</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-6 rounded-lg transition-colors"
        >
            إعادة تحميل الصفحة
        </button>
    </div>
);

const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings, setApiHijriDate, apiHijriDate } = useAppContext();
    const prayerTimesData = usePrayerTimes(settings, setApiHijriDate);

    const contextValue: PrayerTimesContextType = {
        ...prayerTimesData,
        apiHijriDate: apiHijriDate,
    };

    return (
        <PrayerTimesContext.Provider value={contextValue}>
            {children}
        </PrayerTimesContext.Provider>
    );
}

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appData = useAppData();
    if (appData.isDataLoading) return <LoadingScreen />;
    if (appData.appError) return <ErrorScreen message={appData.appError} />;

    return (
        <AppContext.Provider value={appData as AppContextType}>
            <PrayerTimesProvider>
                {children}
            </PrayerTimesProvider>
        </AppContext.Provider>
    );
};

const UserApp: React.FC = () => {
    const { featureToggles } = useAppContext();
    return (
        <UserAppLayout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/prayers" element={<PrayersPage />} />
                <Route path="/azkar" element={<AzkarPage />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/more" element={<MoreListPage />} />
                {featureToggles.challenges && <Route path="/challenges" element={<ChallengesPage />} />}
                {featureToggles.community && <Route path="/community" element={<CommunityPage />} />}
                <Route path="/more/:page" element={<MorePage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </UserAppLayout>
    );
};

const AuthenticatedRoutes: React.FC = () => {
    const { profile } = useAuthContext();

    if (profile?.role === 'admin') {
        return (
            <Routes>
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/*" element={<UserApp />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="/*" element={<UserApp />} />
        </Routes>
    );
};


const AppRoutes: React.FC = () => {
    const { session, isLoading } = useAuthContext();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <AppContextProvider>
            <Routes>
                {session ? (
                    <Route path="/*" element={<AuthenticatedRoutes />} />
                ) : (
                    <>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/more/privacy" element={<MorePage />} />
                        <Route path="/more/terms" element={<MorePage />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                )}
            </Routes>
        </AppContextProvider>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <NotificationToast />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
