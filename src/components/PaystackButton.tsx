'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface PaystackButtonProps {
  plan: 'basic' | 'professional' | 'enterprise';
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  className?: string;
  children: React.ReactNode;
}

export default function PaystackButton({ 
  plan, 
  amount, 
  billingCycle,
  className,
  children 
}: PaystackButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!session) {
      alert('Please login first');
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      // Initialize payment
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          amount: amount * 100, // Convert to kobo/cents
          plan,
          billingCycle,
          metadata: {
            customer_name: session.user.name,
            plan_type: plan,
            billing_cycle: billingCycle
          }
        })
      });

      const data = await response.json();

      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        alert('Payment initialization failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin inline mr-2" size={16} />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}