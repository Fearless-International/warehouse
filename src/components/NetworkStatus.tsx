'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <>
      {/* Offline Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 text-center text-sm font-semibold shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <WifiOff size={16} />
          <span>You're offline - Some features may be limited</span>
        </div>
      </div>

      {/* Toast Notification */}
      {showOfflineToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <div className="bg-red-600 text-white rounded-xl shadow-2xl p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <WifiOff size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold mb-1">Connection Lost</h4>
                <p className="text-sm text-red-100">
                  You're now offline. Changes will be saved locally and synced when connection is restored.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}