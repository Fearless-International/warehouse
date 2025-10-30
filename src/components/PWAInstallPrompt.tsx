'use client';

import { useState, useEffect } from 'react';
import { useLicense } from '@/hooks/useLicense';
import { Download, X, Smartphone, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PWAInstallPrompt() {
  const { hasFeature, license } = useLicense();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has PWA feature
      if (hasFeature('mobilePWA')) {
        setShowPrompt(true);
      } else {
        setShowUpgrade(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [hasFeature]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Upgrade prompt for non-professional users
  if (showUpgrade && !hasFeature('mobilePWA')) {
    return (
      <div className="fixed bottom-6 right-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-2 border-orange-500 z-50 animate-slideIn">
        <button
          onClick={() => setShowUpgrade(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock size={24} className="text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Install Mobile App 📱
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upgrade to <span className="font-bold text-blue-600">Professional</span> to install our Progressive Web App and work offline!
            </p>
            
            <div className="flex gap-2">
              <Link
                href="/pricing"
                className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center font-semibold text-sm hover:shadow-lg transition-all"
              >
                Upgrade Now
              </Link>
              <button
                onClick={() => setShowUpgrade(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Install prompt for professional users
  if (showPrompt && hasFeature('mobilePWA')) {
    return (
      <div className="fixed bottom-6 right-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-2 border-green-500 z-50 animate-slideIn">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} className="text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Install Mobile App ✨
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get faster access and work offline with our Progressive Web App!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Install Now
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}