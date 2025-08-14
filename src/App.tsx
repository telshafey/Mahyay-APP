
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

const MainAppLayout: React.FC = () => {
  const appData = useAppData();

  if (!appData) return <div className="text-white text-center p-10">جاري تحميل بيانات المستخدم...</div>

  return (
    <AppContext.Provider value={appData}>
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
                <p>جاري التحميل...</p>
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