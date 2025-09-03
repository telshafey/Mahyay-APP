
import React from 'react';
// Fix: Corrected react-router-dom import to use namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { AppContext } from './contexts/AppContext.ts';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useAppData } from './hooks/useAppData.ts';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import NotificationToast from './components/NotificationToast.tsx';

// Statically import page components to fix module resolution errors with dynamic imports in the current environment.
import HomePage from './pages/HomePage.tsx';
import PrayersPage from './pages/PrayersPage.tsx';
import AzkarPage from './pages/AzkarPage.tsx';
import QuranPage from './pages/QuranPage.tsx';
import MorePage from './pages/MorePage.tsx';

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
      <div className="min-h-screen bg-gray-50 text-gray-800">
          <Header />
          <main className="pt-[70px] pb-[60px] md:pb-[65px] bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] min-h-screen">
               <div className="p-4 h-full">
                    <ReactRouterDOM.Routes>
                        <ReactRouterDOM.Route path="/" element={<HomePage />} />
                        <ReactRouterDOM.Route path="/prayers" element={<PrayersPage />} />
                        <ReactRouterDOM.Route path="/azkar" element={<AzkarPage />} />
                        <ReactRouterDOM.Route path="/quran" element={<QuranPage />} />
                        <ReactRouterDOM.Route path="/more/:page" element={<MorePage />} />
                        <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" />} />
                    </ReactRouterDOM.Routes>
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
      <ReactRouterDOM.HashRouter>
        <ScrollToTop />
        <ReactRouterDOM.Routes>
          <ReactRouterDOM.Route path="/*" element={<MainAppLayout />} />
        </ReactRouterDOM.Routes>
      </ReactRouterDOM.HashRouter>
    </AuthProvider>
  );
};

export default App;
