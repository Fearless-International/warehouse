'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Key, Loader, CheckCircle, XCircle } from 'lucide-react';

export default function GenerateLicensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    licenseType: 'basic',
    expiryDate: '',
    amount: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/license/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: formData.amount ? parseFloat(formData.amount) : 0
        })
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, data: data.license });
        
        // Reset form
        setTimeout(() => {
          setFormData({
            clientName: '',
            clientEmail: '',
            clientCompany: '',
            licenseType: 'basic',
            expiryDate: '',
            amount: '',
            notes: ''
          });
        }, 3000);
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to generate license' });
    } finally {
      setLoading(false);
    }
  };

  const planPricing = {
    basic: 297,
    professional: 597,
    enterprise: 1497
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Generate New License
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new license for a client
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Client Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" />
              Client Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="john@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({...formData, clientCompany: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  placeholder="Acme Corporation"
                />
              </div>
            </div>
          </div>

          {/* License Configuration */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Key size={20} className="text-purple-600" />
              License Configuration
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  License Type *
                </label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({
                    ...formData, 
                    licenseType: e.target.value,
                    amount: planPricing[e.target.value as keyof typeof planPricing].toString()
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="basic">Basic - $297</option>
                  <option value="professional">Professional - $597</option>
                  <option value="enterprise">Enterprise - $1,497</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  placeholder="297"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for lifetime license</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-500 dark:border-blue-400">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
              Features for {formData.licenseType.charAt(0).toUpperCase() + formData.licenseType.slice(1)} Plan:
            </h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {formData.licenseType === 'basic' && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Up to 5 branches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Up to 10 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Basic features</span>
                  </div>
                </>
              )}
              {formData.licenseType === 'professional' && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Up to 20 branches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Up to 50 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Anomaly Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Advanced Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Custom Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Query System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Mobile PWA</span>
                  </div>
                </>
              )}
              {formData.licenseType === 'enterprise' && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Unlimited branches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Unlimited users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">All Professional features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">White Label</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">API Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Multi-Warehouse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Dedicated Support</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={24} />
                Generating License...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Generate License
              </>
            )}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className={`mt-6 p-6 rounded-xl border-2 ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={28} />
              ) : (
                <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={28} />
              )}
              <div className="flex-1">
                <h3 className={`font-bold text-xl mb-3 ${
                  result.success 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {result.success ? '✅ License Generated Successfully!' : '❌ Generation Failed'}
                </h3>
                
                {result.success ? (
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-500">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">License Key:</p>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 text-lg font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
                          {result.data.licenseKey}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(result.data.licenseKey);
                            alert('License key copied to clipboard!');
                          }}
                          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-500">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Client</p>
                        <p className="font-bold text-gray-900 dark:text-white">{result.data.clientName}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-500">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Type</p>
                        <p className="font-bold text-gray-900 dark:text-white">{result.data.licenseType.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-500">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📧 Send this license key to <strong>{result.data.clientEmail}</strong>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        The client can activate their license at /activate
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push('/admin/licenses')}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        View All Licenses
                      </button>
                      <button
                        onClick={() => setResult(null)}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Generate Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-800 dark:text-red-200">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}