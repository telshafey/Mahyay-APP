import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
    AppContext, 
    useAppContext, 
    useAppData, 
    AuthProvider, 
    useAuthContext, 
    PrayerTimesContext, 
    usePrayerTimes 
} from '@mahyay/core';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import NotificationToast from './components/NotificationToast';
import AdminRoute from './components/AdminRoute';


// Statically import page components.
import HomePage from './pages/HomePage';
import PrayersPage from './pages/PrayersPage';
import AzkarPage from './pages/AzkarPage';
import QuranPage from './pages/QuranPage';
import MorePage from './pages/MorePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ChallengesPage from './pages/ChallengesPage';
// Import public pages
import TermsOfUsePage from './pages/more/TermsOfUsePage';
import PrivacyPolicyPage from './pages/more/PrivacyPolicyPage';


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

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appData = useAppData();

    if (appData.isDataLoading) {
        return <LoadingScreen />;
    }

    if (appData.appError) {
        return <ErrorScreen message={appData.appError} />;
    }

    return (
        <AppContext.Provider value={appData}>
            {children}
        </AppContext.Provider>
    );
}

const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const prayerTimesData = usePrayerTimes();
    return (
        <PrayerTimesContext.Provider value={prayerTimesData}>
            {children}
        </PrayerTimesContext.Provider>
    );
}

const MainAppLayout: React.FC = () => {
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
                        <Route path="/challenges" element={<ChallengesPage />} />
                        <Route path="/more/:page" element={<MorePage />} />
                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
               </div>
          </main>
          <BottomNav />
      </div>
  );
}

const PublicPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] text-white">
        <div className="w-full max-w-3xl">
            {children}
        </div>
    </div>
);

const AppRoutes: React.FC = () => {
    const authContext = useAuthContext();

    if (authContext.isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            {authContext.profile ? (
                <Route path="/*" element={
                    <AppContextProvider>
                        <PrayerTimesProvider>
                            <MainAppLayout />
                        </PrayerTimesProvider>
                    </AppContextProvider>
                } />
            ) : (
                <>
                    <Route path="/login" element={<LoginPage />} />
                     <Route path="/more/terms" element={
                        <PublicPageLayout>
                            <TermsOfUsePage />
                        </PublicPageLayout>
                    } />
                    <Route path="/more/privacy" element={
                        <PublicPageLayout>
                            <PrivacyPolicyPage />
                        </PublicPageLayout>
                    } />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
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
