
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext.ts';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useAppData } from './hooks/useAppData.ts';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import NotificationToast from './components/NotificationToast.tsx';
import AdminRoute from './components/AdminRoute.tsx';

// Statically import page components to fix module resolution errors with dynamic imports in the current environment.
import HomePage from './pages/HomePage.tsx';
import PrayersPage from './pages/PrayersPage.tsx';
import AzkarPage from './pages/AzkarPage.tsx';
import QuranPage from './pages/QuranPage.tsx';
import MorePage from './pages/MorePage.tsx';
import AdminPage from './pages/AdminPage.tsx';

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