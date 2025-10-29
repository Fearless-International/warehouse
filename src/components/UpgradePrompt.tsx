'use client';

import Link from 'next/link';
import { Lock, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredPlan: 'Professional' | 'Enterprise';
  currentPlan?: string;
}

export default function UpgradePrompt({ 
  feature, 
  description, 
  requiredPlan,
  currentPlan = 'Basic' 
}: UpgradePromptProps) {
  
  const benefits = {
    Professional: [
      '✨ Anomaly Detection System',
      '📊 Advanced Analytics Dashboard',
      '📋 Custom Report Generation',
      '❓ Query Management System',
      '📱 Mobile PWA App',
      '⚡ Priority Support',
      '🔄 1 Year Updates'
    ],
    Enterprise: [
      '🎨 White Label Branding',
      '🔌 Full REST API Access',
      '📱 SMS Notifications',
      '🏢 Multi-Warehouse Support',
      '👨‍💼 Dedicated Support Manager',
      '♾️ Unlimited Branches & Users',
      '🔄 Lifetime Updates'
    ]
  };

  const pricing = {
    Professional: '$597',
    Enterprise: '$1,497'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700">
          
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white text-center overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                <Lock size={40} />
              </div>
              <h1 className="text-4xl font-bold mb-2">🔒 {feature}</h1>
              <p className="text-xl text-white/90 mb-4">{description}</p>
              <div className="inline-block bg-white/20 backdrop-blur-xl px-6 py-2 rounded-full border border-white/30">
                <span className="text-sm font-semibold">Current Plan: {currentPlan}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            
            {/* Upgrade CTA Banner */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-500 dark:border-orange-400 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Sparkles className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" size={28} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                    Upgrade to {requiredPlan} Required
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 mb-3">
                    This feature is available in the <strong>{requiredPlan}</strong> plan. 
                    Upgrade now for just <strong>{pricing[requiredPlan]}</strong> one-time payment.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                    <CheckCircle size={16} />
                    <span>No monthly fees • Lifetime access • Priority support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={24} />
                What You'll Get with {requiredPlan}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {benefits[requiredPlan].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Comparison */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="opacity-50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPlan}</p>
                  <p className="text-xs text-gray-500 mt-1">Limited Features</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="text-purple-600" size={32} />
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-4">
                  <p className="text-sm mb-1">Upgrade to</p>
                  <p className="text-3xl font-bold">{requiredPlan}</p>
                  <p className="text-sm mt-1">{pricing[requiredPlan]} one-time</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                href="/pricing"
                className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-center hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Sparkles size={20} />
                Upgrade to {requiredPlan} Now
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                ← Back to Dashboard
              </Link>
            </div>

            {/* Contact Support */}
            <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Have questions about upgrading?
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <a href="mailto:sales@yourcompany.com" className="text-blue-600 hover:underline font-semibold">
                  📧 Email Sales Team
                </a>
                <span className="text-gray-400">•</span>
                <a href="/contact" className="text-blue-600 hover:underline font-semibold">
                  💬 Live Chat
                </a>
                <span className="text-gray-400">•</span>
                <a href="tel:+1234567890" className="text-blue-600 hover:underline font-semibold">
                  📞 Call Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💳 Secure Payment • 🔒 30-Day Money Back Guarantee • ⚡ Instant Activation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}