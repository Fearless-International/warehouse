'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, CheckCircle, XCircle, Loader, Shield, Sparkles } from 'lucide-react';

export default function ActivatePage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const formatLicenseKey = (value: string) => {
    // Remove any non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    
    // Split into groups of 4
    const groups = cleaned.match(/.{1,4}/g) || [];
    
    // Join with hyphens
    return groups.join('-').substring(0, 19); // Max length: XXXX-XXXX-XXXX-XXXX
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value.toUpperCase());
    setLicenseKey(formatted);
  };

  const handleActivate = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setResult(null);

  try {
    const domain = window.location.hostname;
    
    const res = await fetch('/api/license/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, domain })
    });

    const data = await res.json();

    if (data.valid) {
      setResult({ success: true, data: data.license });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh(); // Refresh to load new license
      }, 2000);
    } else {
      setResult({ success: false, error: data.error });
    }
  } catch (error) {
    setResult({ success: false, error: 'Activation failed. Please check your connection and try again.' });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-white/20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Key className="text-white" size={36} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Activate License
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your license key to unlock all features
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-blue-600" size={20} />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                Protected Features
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <span>Anomaly Detection System</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <span>Advanced Analytics Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <span>Custom Report Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600" />
                <span>Mobile PWA Application</span>
              </div>
            </div>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleActivate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={handleInputChange}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-center text-lg tracking-wider bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={19}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Enter the 16-character license key you received
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || licenseKey.length < 19}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Activating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Activate License
                </>
              )}
            </button>
          </form>

          {/* Result Message */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={24} />
                ) : (
                  <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
                )}
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 ${
                    result.success 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {result.success ? '✅ License Activated!' : '❌ Activation Failed'}
                  </h3>
                  {result.success ? (
                    <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <p>Welcome, <strong>{result.data.clientName}</strong>!</p>
                      <p>Plan: <strong className="text-green-600">{result.data.type.toUpperCase()}</strong></p>
                      <p>Max Branches: <strong>{result.data.maxBranches}</strong></p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        🎉 Redirecting to dashboard...
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-800 dark:text-red-200">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have a license?{' '}
              <a href="/pricing" className="text-blue-600 hover:underline font-semibold">
                Purchase Now
              </a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Need help?{' '}
              <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 text-white text-sm">
            <Shield size={16} />
            <span>Secure Activation • 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}