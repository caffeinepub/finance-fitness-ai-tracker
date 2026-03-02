import React, { useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

const PERMISSION_KEY = 'stepTrackingPermission';

// Register service worker for PWA support
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch(() => {
          // SW registration failed — app still works without it
        });
    });
  }
}

registerServiceWorker();

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const permissionRequestedRef = useRef(false);

  // Request step tracking permission once after login
  useEffect(() => {
    if (!isAuthenticated) {
      permissionRequestedRef.current = false;
      return;
    }
    const stored = localStorage.getItem(PERMISSION_KEY);
    if (stored && stored !== 'unknown') return; // already decided
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;

    // Small delay to let the UI settle after login
    const timer = setTimeout(async () => {
      if (typeof DeviceMotionEvent === 'undefined') {
        localStorage.setItem(PERMISSION_KEY, 'unsupported');
        return;
      }
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const result = await (DeviceMotionEvent as any).requestPermission();
          localStorage.setItem(PERMISSION_KEY, result === 'granted' ? 'granted' : 'denied');
        } catch {
          localStorage.setItem(PERMISSION_KEY, 'denied');
        }
      } else {
        // Android / desktop — implicit permission, mark as granted
        localStorage.setItem(PERMISSION_KEY, 'granted');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

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
