'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLicense } from '@/hooks/useLicense';
import { Check, X, Zap, Crown, Rocket, Shield, TrendingUp, Users, Package, AlertTriangle, BarChart3, FileText, MessageSquare, Smartphone, Code, Palette, Bell, Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const { data: session } = useSession();
  const { license, active } = useLicense();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Basic',
      tagline: 'Perfect for getting started',
      icon: Package,
      price: billingCycle === 'monthly' ? 0 : 0,
      originalPrice: null,
      color: 'from-gray-500 to-gray-600',
      features: [
        { name: 'Up to 5 branches', included: true },
        { name: 'Up to 10 users', included: true },
        { name: 'Request management', included: true },
        { name: 'Product inventory', included: true },
        { name: 'Basic complaints system', included: true },
        { name: 'User management', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Mobile responsive', included: true },
        { name: 'Anomaly detection', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom reports', included: false },
        { name: 'Query system', included: false },
        { name: 'PWA (offline mode)', included: false },
      ],
      cta: license?.type === 'basic' ? 'Current Plan' : 'Free Forever',
      current: license?.type === 'basic'
    },
    {
      name: 'Professional',
      tagline: 'Most popular for growing teams',
      icon: Zap,
      price: billingCycle === 'monthly' ? 49 : 497,
      originalPrice: billingCycle === 'monthly' ? 59 : 588,
      popular: true,
      color: 'from-blue-500 via-purple-500 to-pink-500',
      features: [
        { name: 'Up to 20 branches', included: true },
        { name: 'Up to 50 users', included: true },
        { name: 'Everything in Basic', included: true },
        { name: 'AI-powered anomaly detection', included: true, highlight: true },
        { name: 'Advanced analytics & insights', included: true, highlight: true },
        { name: 'Custom reports builder', included: true, highlight: true },
        { name: 'Query management system', included: true, highlight: true },
        { name: 'Progressive Web App (PWA)', included: true, highlight: true },
        { name: 'Priority email support', included: true },
        { name: 'Data export (CSV, PDF)', included: true },
        { name: 'API access', included: false },
        { name: 'White label branding', included: false },
        { name: 'SMS notifications', included: false },
      ],
      cta: license?.type === 'professional' ? 'Current Plan' : 'Upgrade Now',
      current: license?.type === 'professional',
      savings: billingCycle === 'yearly' ? 'Save $91/year' : null
    },
    {
      name: 'Enterprise',
      tagline: 'For large-scale operations',
      icon: Crown,
      price: billingCycle === 'monthly' ? 149 : 1497,
      originalPrice: billingCycle === 'monthly' ? 179 : 2148,
      color: 'from-orange-500 via-red-500 to-pink-600',
      features: [
        { name: 'Unlimited branches', included: true },
        { name: 'Unlimited users', included: true },
        { name: 'Everything in Professional', included: true },
        { name: 'REST API access', included: true, highlight: true },
        { name: 'White label branding', included: true, highlight: true },
        { name: 'Multi-warehouse support', included: true, highlight: true },
        { name: 'SMS notifications', included: true, highlight: true },
        { name: 'Custom integrations', included: true, highlight: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Priority phone support', included: true },
        { name: 'Custom training sessions', included: true },
        { name: 'SLA guarantee (99.9%)', included: true },
        { name: 'Custom development', included: true },
      ],
      cta: license?.type === 'enterprise' ? 'Current Plan' : 'Contact Sales',
      current: license?.type === 'enterprise',
      savings: billingCycle === 'yearly' ? 'Save $651/year' : null
    }
  ];

  const addons = [
    {
      name: 'Admin Module',
      description: 'Unlock admin dashboard for self-management',
      icon: Shield,
      price: 497,
      features: ['Full admin access', 'User management', 'Branch control', 'System analytics']
    },
    {
      name: 'Custom Branding',
      description: 'Make it yours with your logo and colors',
      icon: Palette,
      price: 297,
      features: ['Custom logo', 'Brand colors', 'Favicon', 'Email templates']
    },
    {
      name: 'Priority Support',
      description: '24/7 dedicated support team',
      icon: Bell,
      price: 197,
      features: ['24/7 availability', 'Phone support', 'Slack channel', '1-hour response']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full mb-6 shadow-lg">
            <Sparkles size={20} />
            <span className="font-semibold">Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Start with Basic features for free, then upgrade as you grow. All plans include core warehouse management.
          </p>

          {/* Current Plan Badge */}
          {license && active && (
            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Current Plan: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{license.type.toUpperCase()}</span>
              </span>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
            >
              <div className={`absolute top-1 ${billingCycle === 'yearly' ? 'right-1' : 'left-1'} w-5 h-5 bg-white rounded-full transition-all shadow-lg`}></div>
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Yearly
            </span>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-semibold">
              Save up to 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900' : ''
              } ${plan.current ? 'ring-4 ring-green-500 ring-offset-4 dark:ring-offset-gray-900' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-xl">
                  Most Popular
                </div>
              )}

              {/* Current Badge */}
              {plan.current && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-xl">
                  Current Plan
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-br ${plan.color} p-8 text-white`}>
                <plan.icon size={40} className="mb-4" />
                <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/80 text-sm">{plan.tagline}</p>
                
                <div className="mt-6">
                  {plan.originalPrice && (
                    <span className="text-white/60 line-through text-lg mr-2">
                      ${plan.originalPrice}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-white/80">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-300 text-sm mt-2 font-semibold">{plan.savings}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          feature.highlight ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-green-500'
                        }`}>
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <X size={12} className="text-gray-400" />
                        </div>
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                      } ${feature.highlight ? 'font-semibold' : ''}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.current ? (
                  <button
                    disabled
                    className="w-full py-4 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.name === 'Enterprise' ? (
                  <Link
                    href="mailto:sales@yourcompany.com"
                    className="block w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-2xl transition-all"
                  >
                    Contact Sales
                  </Link>
                ) : plan.name === 'Basic' ? (
                  <Link
                    href="/activate"
                    className="block w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:shadow-2xl transition-all"
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <Link
                    href="/activate"
                    className="block w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl transition-all"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Addons Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Power Up with Add-ons
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enhance any plan with these powerful additions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {addons.map((addon, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <addon.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {addon.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {addon.description}
                </p>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  ${addon.price}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/one-time</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {addon.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  Add to Plan
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! The Basic plan is free forever. Try it risk-free with no credit card required.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                What happens when I upgrade?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All features unlock instantly. Your data remains intact and accessible immediately.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                Can I get a custom plan?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely! Contact our sales team for custom Enterprise solutions tailored to your needs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Warehouse Management?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join hundreds of businesses streamlining their operations
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/activate"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="mailto:sales@yourcompany.com"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white text-white rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}