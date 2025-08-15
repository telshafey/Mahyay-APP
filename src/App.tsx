

import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext.ts';
import { AuthContext, AuthProvider } from './contexts/AuthContext.tsx';
import { useAppData } from './hooks/useAppData.ts';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import HomePage from './pages/HomePage.tsx';
import PrayersPage from './pages/PrayersPage.tsx';
import AzkarPage from './pages/AzkarPage.tsx';
import QuranPage from './pages/QuranPage.tsx';
import MorePage from './pages/MorePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CommunityHubPage from './pages/CommunityHubPage.tsx';
import GroupDetailPage from './pages/GroupDetailPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import GlassCard from './components/GlassCard.tsx';
import NotificationToast from './components/NotificationToast.tsx';

const DataErrorComponent: React.FC<{ error: string }> = ({ error }) => {
    const authContext = useContext(AuthContext);
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] p-4 flex flex-col justify-center items-center text-white">
            <GlassCard className="!bg-red-900/50 !border-red-400/50 text-center">
                <h2 className="text-2xl font-bold mb-4">🚨 خطأ حرج</h2>
                <p className="mb-4">{error}</p>
                <p className="text-sm text-yellow-300">
                    هذا الخطأ يعني عادةً أن هيكل قاعدة البيانات في Supabase غير صحيح. يرجى التأكد من أنك قمت بتشغيل أحدث نص برمجي (SQL) في محرر Supabase SQL.
                </p>
                <button 
                    onClick={() => authContext?.logout()} 
                    className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-6 rounded-full transition-colors"
                >
                    تسجيل الخروج
                </button>
            </GlassCard>
        </div>
    );
};


const MainAppLayout: React.FC = () => {
  const appData = useAppData();

  if (appData.dataError) {
      return <DataErrorComponent error={appData.dataError} />;
  }

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
      <div className="min-h-screen bg-gray-50 text-gray-800">
          <Header />
          <main className="pt-[70px] pb-[60px] md:pb-[65px] bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] min-h-screen">
               <div className="p-4">
                   <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/prayers" element={<PrayersPage />} />
                      <Route path="/azkar" element={<AzkarPage />} />
                      <Route path="/quran" element={<QuranPage />} />
                      <Route path="/community" element={<CommunityHubPage />} />
                      <Route path="/community/group/:groupId" element={<GroupDetailPage />} />
                      <Route path="/more/:page" element={<MorePage />} />
                      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                      <Route path="*" element={<Navigate to="/" />} />
                   </Routes>
               </div>
          </main>
          <BottomNav />
      </div>
    </AppContext.Provider>
  );
}

const AppRouter: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (authContext?.isLoading) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47]">
                <h1 className="font-amiri text-4xl mb-4 animate-pulse">مَحيّاي</h1>
                <p>جاري التحقق من الهوية...</p>
            </div>
        );
    }
    
    return (
        <Routes>
            {authContext?.user ? (
                 <Route path="/*" element={<MainAppLayout />} />
            ) : (
                 <Route path="*" element={<LoginPage />} />
            )}
        </Routes>
    )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <AppRouter />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;