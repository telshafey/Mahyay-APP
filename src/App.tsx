import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAppData } from './hooks/useAppData';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import NotificationToast from './components/NotificationToast';
import AdminRoute from './components/AdminRoute';

// Statically import page components to resolve module loading errors.
import HomePage from './pages/HomePage';
import PrayersPage from './pages/PrayersPage';
import AzkarPage from './pages/AzkarPage';
import QuranPage from './pages/QuranPage';
import MorePage from './pages/MorePage';
import AdminPage from './pages/AdminPage';

const MainAppLayout: React.FC = () => {
  const appData = useAppData();

  if (appData.isDataLoading) {
    return (
        <div className="h-screen flex flex-col justify-center items-center text-white bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47]">
            <h1 className="font-amiri text-4xl mb-4 animate-pulse">مَحيّاي</h1>
            <p>جاري تحميل بياناتك...</p>
        </div>
    );
  }

  return (
    <AppContext.Provider value={appData}>
      <NotificationToast />
      <div className="min-h-screen">
          <Header />
          <main className="pt-[70px] pb-[60px] md:pb-[65px]">
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
    </AppContext.Provider>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/*" element={<MainAppLayout />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;