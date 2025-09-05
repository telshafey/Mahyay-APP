import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { useAppData } from './hooks/useAppData';
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

const LoadingScreen: React.FC = () => (
    <div className="h-screen flex flex-col justify-center items-center text-white bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47]">
        <h1 className="font-amiri text-4xl mb-4 animate-pulse">مَحيّاي</h1>
        <p>جاري التحميل...</p>
    </div>
);

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appData = useAppData();
    if (appData.isDataLoading) {
        return <LoadingScreen />;
    }
    return (
        <AppContext.Provider value={appData}>
            {children}
        </AppContext.Provider>
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
                        <MainAppLayout />
                    </AppContextProvider>
                } />
            ) : (
                <>
                    <Route path="/login" element={<LoginPage />} />
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