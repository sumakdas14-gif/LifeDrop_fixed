import { useCallback, useEffect, useState } from 'react';
import { AuthPortalPage } from './components/AuthPortalPage';
import { DonorDashboardPage } from './components/DonorDashboardPage';
import { FindBloodPage } from './components/FindBloodPage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { Navbar } from './components/Navbar';
import { RequestsBoardPage } from './components/RequestsBoardPage';
import type { AppView, BloodGroup, DonorPublic } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [prefillBloodGroup, setPrefillBloodGroup] = useState<BloodGroup | ''>('');
  const [prefillCity, setPrefillCity] = useState('');

  // Auth token kept strictly in React memory
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentDonor, setCurrentDonor] = useState<DonorPublic | null>(null);

  const [stats, setStats] = useState({
    totalDonors: 8,
    availableDonors: 7,
    openRequests: 3,
  });
  const [refreshSignal, setRefreshSignal] = useState(0);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch('/api/donors');
      if (res.ok) {
        const data = (await res.json()) as {
          stats?: { totalDonors: number; availableDonors: number; openRequests: number };
        };
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // Retain last known stats if offline
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats, refreshSignal]);

  const handleNavigate = (
    view: AppView,
    opts?: {
      authTab?: 'login' | 'register';
      sectionId?: string;
      prefillBloodGroup?: BloodGroup | '';
      prefillCity?: string;
    }
  ) => {
    if (opts?.authTab) setAuthTab(opts.authTab);
    if (opts?.prefillBloodGroup !== undefined) setPrefillBloodGroup(opts.prefillBloodGroup);
    if (opts?.prefillCity !== undefined) setPrefillCity(opts.prefillCity);

    setCurrentView(view);

    if (opts?.sectionId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(opts.sectionId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = (token: string, donor: DonorPublic) => {
    setAuthToken(token);
    setCurrentDonor(donor);
    setRefreshSignal((n) => n + 1);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentDonor(null);
    setRefreshSignal((n) => n + 1);
    setCurrentView('home');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#18181B]">
      <Navbar
        currentView={currentView}
        currentDonor={currentDonor}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentView === 'home' && <HomePage stats={stats} onNavigate={handleNavigate} />}

        {currentView === 'find' && (
          <FindBloodPage
            initialBloodGroup={prefillBloodGroup}
            initialCity={prefillCity}
            currentDonor={currentDonor}
            authToken={authToken}
            onRequestCreated={() => setRefreshSignal((n) => n + 1)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'requests' && (
          <RequestsBoardPage
            currentDonor={currentDonor}
            authToken={authToken}
            refreshSignal={refreshSignal}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'auth' && (
          <AuthPortalPage initialTab={authTab} onAuthSuccess={handleAuthSuccess} />
        )}

        {currentView === 'dashboard' && currentDonor && authToken && (
          <DonorDashboardPage
            donor={currentDonor}
            authToken={authToken}
            onDonorUpdated={(updated) => {
              setCurrentDonor(updated);
              setRefreshSignal((n) => n + 1);
            }}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && (!currentDonor || !authToken) && (
          <AuthPortalPage initialTab="login" onAuthSuccess={handleAuthSuccess} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
