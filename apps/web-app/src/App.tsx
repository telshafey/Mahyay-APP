import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext, useAppContext, useAppData, AuthProvider, useAuthContext, PrayerTimesContext, usePrayerTimes } from '@mahyay/core';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import NotificationToast from './components/NotificationToast';

// Statically import page components.
import HomePage from './pages/HomePage';
import PrayersPage from './pages/PrayersPage';
import AzkarPage from './pages/AzkarPage';
import QuranPage from './pages/QuranPage';
import MorePage from './pages/MorePage';
import ChallengesPage from './pages/ChallengesPage';
import CommunityPage from './pages/CommunityPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';


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
    const { settings } = useAppContext();
    const prayerTimesData = usePrayerTimes(settings);
    return (
        <PrayerTimesContext.Provider value={prayerTimesData}>
            {children}
        </PrayerTimesContext.Provider>
    );
}

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile } = useAuthContext();
    // Wrap PrayerTimesProvider around useAppData so it can be accessed within
    return (
         <PrayerTimesProvider>
            <InnerAppContextProvider profile={profile}>
                {children}
            </InnerAppContextProvider>
        </PrayerTimesProvider>
    )
};

// This inner component is necessary because useAppData depends on usePrayerTimesContext
const InnerAppContextProvider: React.FC<{ children: React.ReactNode; profile: any; }> = ({ children, profile }) => {
    const appData = useAppData();
    if (appData.isDataLoading) return <LoadingScreen />;
    if (appData.appError) return <ErrorScreen message={appData.appError} />;

    return (
        <AppContext.Provider value={appData}>
            {children}
        </AppContext.Provider>
    );
}


const UserApp: React.FC = () => {
    const { featureToggles } = useAppContext();
    return (
        <div className="min-h-screen">
            <NotificationToast />
            <Header />
            <main className="pt-[60px] pb-[60px] md:pb-[65px]">
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/prayers" element={<PrayersPage />} />
                        <Route path="/azkar" element={<AzkarPage />} />
                        <Route path="/quran" element={<QuranPage />} />
                        {featureToggles.challenges && <Route path="/challenges" element={<ChallengesPage />} />}
                        {featureToggles.community && <Route path="/community" element={<CommunityPage />} />}
                        <Route path="/more/:page" element={<MorePage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </main>
            <BottomNav />
        </div>
    );
};


const AppRoutes: React.FC = () => {
    const { session, profile, isLoading } = useAuthContext();

    if (isLoading) {
        return <LoadingScreen />;
    }

    const isAdmin = profile?.role === 'admin';

    return (
        <Routes>
            {!session ? (
                <>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/more/privacy" element={<MorePage />} />
                    <Route path="/more/terms" element={<MorePage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            ) : (
                <Route
                    path="/*"
                    element={
                        <AppContextProvider>
                            <Routes>
                                {isAdmin && <Route path="/admin/*" element={<AdminPage />} />}
                                <Route path="/*" element={<UserApp />} />
                                <Route path="*" element={<Navigate to={isAdmin ? "/admin" : "/"} replace />} />
                            </Routes>
                        </AppContextProvider>
                    }
                />
            )}
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
