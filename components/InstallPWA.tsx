'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check standalone mode (PWA already installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandaloneMode) {
      // Defer state update to next microtask to prevent synchronous cascading re-render
      queueMicrotask(() => setIsStandalone(true));
      return;
    }

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIosDevice) {
      queueMicrotask(() => {
        setIsIOS(true);
        setIsInstallable(true);
      });
    }

    // 3. Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-emerald-600 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Install Milimani Savings</p>
          <p className="text-xs text-emerald-100">
            {isIOS
              ? 'Tap Share icon below then "Add to Home Screen"'
              : 'Add to home screen for quick access'}
          </p>
        </div>

        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}