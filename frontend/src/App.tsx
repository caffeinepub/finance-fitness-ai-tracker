import React from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

// Register service worker for PWA support
// Only register on HTTPS or localhost to avoid errors in unsupported environments
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const isSecure =
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';

  if (!isSecure) return;

  const doRegister = () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        // Check for updates on every app launch
        registration.update().catch(() => {});
      })
      .catch((err) => {
        // SW registration failed — app still works without it
        console.warn('Service worker registration failed:', err);
      });
  };

  if (document.readyState === 'complete') {
    doRegister();
  } else {
    window.addEventListener('load', doRegister);
  }
}

registerServiceWorker();

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading FinFit…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <Toaster />
      </>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup ? (
        <ProfileSetupModal open={true} />
      ) : (
        <Dashboard />
      )}
      <Toaster />
    </>
  );
}
