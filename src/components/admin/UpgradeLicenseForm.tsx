'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Crown, Zap, Package } from 'lucide-react';

export default function UpgradeLicenseForm({ license }: any) {
  const [selectedPlan, setSelectedPlan] = useState(license.licenseType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const plans = [
    { value: 'basic', label: 'Basic', icon: Package, color: 'from-gray-500 to-gray-600' },
    { value: 'professional', label: 'Professional', icon: Zap, color: 'from-blue-500 to-purple-500' },
    { value: 'enterprise', label: 'Enterprise', icon: Crown, color: 'from-orange-500 to-red-500' }
  ];

  const handleUpgrade = async () => {
    if (selectedPlan === license.licenseType) {
      alert('Please select a different plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/licenses/${license._id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newLicenseType: selectedPlan })
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ License upgraded successfully!');
        router.push('/admin/licenses/active');
        router.refresh();
      } else {
        setError(data.error || 'Failed to upgrade license');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-gray-200 dark:border-gray-700">
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Current License */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Current License
        </label>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
          <p className="text-lg font-bold text-gray-900 dark:text-white uppercase">
            {license.licenseType} Plan
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            License Key: {license.licenseKey}
          </p>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Upgrade To
        </label>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.value === license.licenseType;
            const isSelected = plan.value === selectedPlan;

            return (
              <button
                key={plan.value}
                onClick={() => setSelectedPlan(plan.value)}
                disabled={isCurrent}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  isCurrent ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900 border-gray-300' :
                  isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Current
                  </span>
                )}
                
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {plan.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrade Arrow */}
      {selectedPlan !== license.licenseType && (
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-lg">
            <span className="font-bold text-gray-900 dark:text-white uppercase">{license.licenseType}</span>
          </div>
          <ArrowRight size={32} className="text-blue-600" />
          <div className="bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <span className="font-bold text-blue-900 dark:text-blue-100 uppercase">{selectedPlan}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleUpgrade}
          disabled={loading || selectedPlan === license.licenseType}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '⏳ Upgrading...' : '✨ Upgrade License'}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}