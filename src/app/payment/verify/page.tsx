'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [licenseKey, setLicenseKey] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/payment/verify?reference=${reference}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Payment successful! Your license has been generated.');
        setLicenseKey(data.licenseKey);
        
        // Redirect to activation page after 3 seconds
        setTimeout(() => {
          router.push(`/activate?key=${data.licenseKey}`);
        }, 3000);
      } else {
        setStatus('failed');
        setMessage(data.error || 'Payment verification failed');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('An error occurred while verifying payment');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center">
        
        {status === 'verifying' && (
          <>
            <Loader2 size={64} className="mx-auto mb-6 text-blue-600 animate-spin" />
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Verifying Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} className="mx-auto mb-6 text-green-600" />
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            
            {licenseKey && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2 font-semibold">
                  Your License Key:
                </p>
                <code className="text-lg font-mono font-bold text-green-900 dark:text-green-100">
                  {licenseKey}
                </code>
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to activation page...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={64} className="mx-auto mb-6 text-red-600" />
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Payment Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Back to Pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
}