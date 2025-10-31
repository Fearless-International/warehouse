import Link from "next/link";
import { 
  BookOpen, 
  Rocket, 
  Users, 
  Building2, 
  Package, 
  FileText, 
  Bell, 
  Shield, 
  Key, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Zap,
  Crown,
  CheckCircle,
  ArrowRight,
  Download,
  Play,
  GitBranch,
  Lock,
  Unlock,
  Sparkles,
  DollarSign,
  CreditCard,
  Mail,
  Phone,
  Globe
} from 'lucide-react';


export default function DocumentationPage() {
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Rocket,
      color: 'from-blue-500 to-cyan-500',
      items: [
        {
          title: 'Quick Start Guide',
          description: 'Get up and running in 5 minutes',
          steps: [
            'Login with your admin credentials',
            'Generate a license key for your domain',
            'Activate the license at /activate',
            'Start managing your warehouse operations'
          ]
        },
        {
          title: 'System Requirements',
          description: 'What you need to run the system',
          steps: [
            'Modern web browser (Chrome, Firefox, Safari, Edge)',
            'Internet connection',
            'Valid license key',
            'Admin or assigned role access'
          ]
        }
      ]
    },
    {
      id: 'user-roles',
      title: 'User Roles & Permissions',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      items: [
        {
          title: 'Administrator',
          description: 'Full system access and control',
          permissions: [
            'Manage all users and branches',
            'Generate and manage licenses',
            'View all analytics and reports',
            'Configure system settings',
            'Access all features regardless of license'
          ]
        },
        {
          title: 'Warehouse Manager',
          description: 'Oversee warehouse operations',
          permissions: [
            'Approve/reject branch requests',
            'Manage product inventory',
            'View warehouse analytics',
            'Send queries to branches',
            'Monitor anomalies (Professional+)'
          ]
        },
        {
          title: 'Branch Manager',
          description: 'Manage branch operations',
          permissions: [
            'Submit product requests',
            'View request history',
            'Submit complaints',
            'Respond to warehouse queries',
            'View branch-specific reports'
          ]
        },
        {
          title: 'HR Manager',
          description: 'Human resources management',
          permissions: [
            'View user analytics',
            'Monitor system usage',
            'Access HR reports',
            'View branch performance',
            'Track employee activities'
          ]
        }
      ]
    },
    {
      id: 'core-features',
      title: 'Core Features',
      icon: Package,
      color: 'from-green-500 to-emerald-500',
      items: [
        {
          title: 'Request Management',
          description: 'Streamlined product request workflow',
          features: [
            'Create product requests with multiple items',
            'Real-time status tracking',
            'Approval/rejection workflow',
            'Request history and search',
            'PDF export capabilities'
          ]
        },
        {
          title: 'Inventory Management',
          description: 'Complete product catalog control',
          features: [
            'Add/edit products with details',
            'Stock level monitoring',
            'Product categorization',
            'Bulk import/export',
            'Product images and descriptions'
          ]
        },
        {
          title: 'Branch Management',
          description: 'Multi-location support',
          features: [
            'Create and manage branches',
            'Assign branch managers',
            'Track branch performance',
            'Location-based analytics',
            'Branch-specific settings'
          ]
        },
        {
          title: 'Complaints System',
          description: 'Issue reporting and resolution',
          features: [
            'Submit detailed complaints',
            'Attach supporting documents',
            'Status tracking (Open/In Progress/Resolved)',
            'Response management',
            'Complaint history'
          ]
        }
      ]
    },
    {
      id: 'professional-features',
      title: 'Professional Features',
      icon: Zap,
      color: 'from-blue-600 to-purple-600',
      items: [
        {
          title: 'Anomaly Detection',
          description: 'AI-powered fraud prevention',
          features: [
            'Automatic detection of unusual order quantities',
            'Compare against historical patterns',
            'Flag high/low variance orders',
            'Risk scoring system',
            'Detailed anomaly reports'
          ]
        },
        {
          title: 'Query System',
          description: 'Communication between warehouse and branches',
          features: [
            'Send queries about unusual orders',
            'Real-time notifications',
            'Response tracking',
            'Query history and search',
            'Automated reminders'
          ]
        },
        {
          title: 'Advanced Analytics',
          description: 'Comprehensive business insights',
          features: [
            'Interactive charts and graphs',
            'Trend analysis',
            'Predictive analytics',
            'Custom date ranges',
            'Export to PDF/CSV'
          ]
        },
        {
          title: 'Custom Reports',
          description: 'Build your own reports',
          features: [
            'Drag-and-drop report builder',
            'Multiple data sources',
            'Scheduled report generation',
            'Email delivery',
            'Template library'
          ]
        },
        {
          title: 'Progressive Web App (PWA)',
          description: 'Mobile app experience',
          features: [
            'Install on mobile devices',
            'Work offline',
            'Push notifications',
            'Fast loading',
            'App-like experience'
          ]
        }
      ]
    },
    {
      id: 'enterprise-features',
      title: 'Enterprise Features',
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      items: [
        {
          title: 'REST API Access',
          description: 'Integrate with external systems',
          features: [
            'Full API documentation',
            'Authentication tokens',
            'Webhooks support',
            'Rate limiting',
            'API playground'
          ]
        },
        {
          title: 'White Label Branding',
          description: 'Make it yours',
          features: [
            'Custom logo',
            'Brand colors',
            'Custom domain',
            'Email templates',
            'Favicon customization'
          ]
        },
        {
          title: 'Multi-Warehouse Support',
          description: 'Manage multiple warehouses',
          features: [
            'Unlimited warehouses',
            'Inter-warehouse transfers',
            'Consolidated reporting',
            'Warehouse-specific permissions',
            'Cross-warehouse analytics'
          ]
        },
        {
          title: 'SMS Notifications',
          description: 'Instant alerts via SMS',
          features: [
            'Request status updates',
            'Critical alerts',
            'Custom message templates',
            'Bulk SMS sending',
            'Delivery reports'
          ]
        }
      ]
    },
    {
      id: 'license-management',
      title: 'License Management',
      icon: Key,
      color: 'from-indigo-500 to-purple-500',
      items: [
        {
          title: 'License Types',
          description: 'Choose the right plan for your needs',
          plans: [
            {
              name: 'Basic',
              price: '₵300/mo or ₵4,700/yr',
              features: ['5 branches', '10 users', 'Core features']
            },
            {
              name: 'Professional',
              price: '₵800/mo or ₵8,000/yr',
              features: ['20 branches', '50 users', 'Advanced features', 'Analytics', 'PWA']
            },
            {
              name: 'Enterprise',
              price: '₵2,400/mo or ₵24,000/yr',
              features: ['Unlimited', 'API access', 'White label', 'SMS', 'Priority support']
            }
          ]
        },
        {
          title: 'License Activation',
          description: 'How to activate your license',
          steps: [
            'Admin generates license key in admin panel',
            'Go to /activate page',
            'Enter your license key',
            'License is activated for entire domain',
            'All users on domain get features instantly'
          ]
        },
        {
          title: 'License Upgrading',
          description: 'Upgrade to unlock more features',
          steps: [
            'Admin goes to Licenses → Active License',
            'Click "Upgrade License"',
            'Select new plan (Professional/Enterprise)',
            'Confirm upgrade and payment',
            'Features unlock immediately'
          ]
        }
      ]
    },
    {
      id: 'payment-system',
      title: 'Payment Integration',
      icon: CreditCard,
      color: 'from-green-500 to-teal-500',
      items: [
        {
          title: 'Paystack Integration',
          description: 'Secure payment processing',
          features: [
            'Accept all major cards',
            'Mobile money support',
            'Instant payment verification',
            'Automatic license generation',
            'Secure payment gateway'
          ]
        },
        {
          title: 'Payment Flow',
          description: 'How payments work',
          steps: [
            'User selects plan on pricing page',
            'Click "Upgrade Now" or "Pay Now"',
            'Redirected to secure Paystack payment page',
            'Complete payment with card details',
            'System verifies payment automatically',
            'License key generated and emailed',
            'User activates license at /activate'
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'Security Features',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      items: [
        {
          title: 'Data Protection',
          description: 'Your data is safe with us',
          features: [
            'Encrypted database connections',
            'Secure password hashing (bcrypt)',
            'HTTPS/SSL encryption',
            'Regular security audits',
            'GDPR compliance ready'
          ]
        },
        {
          title: 'License Security',
          description: 'Anti-tampering measures',
          features: [
            'License signature verification',
            'One license per domain',
            'Server-side validation',
            '24-hour heartbeat checks',
            'Automatic suspension detection'
          ]
        },
        {
          title: 'User Authentication',
          description: 'Secure login system',
          features: [
            'NextAuth.js authentication',
            'Session management',
            'Role-based access control',
            'Password reset functionality',
            'Account lockout protection'
          ]
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notification System',
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
      items: [
        {
          title: 'Real-Time Alerts',
          description: 'Stay informed instantly',
          types: [
            'Request status updates',
            'New complaints received',
            'Query responses',
            'Anomaly detections',
            'License expiry warnings'
          ]
        },
        {
          title: 'Notification Center',
          description: 'Manage all your alerts',
          features: [
            'Unread badge counter',
            'Mark as read functionality',
            'Filter by type',
            'Notification history',
            'Email notifications (optional)'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      items: [
        {
          title: 'Common Issues',
          description: 'Quick solutions to common problems',
          issues: [
            {
              problem: 'License not activating',
              solution: 'Ensure you\'re using the exact license key provided. Check internet connection. Contact support if issue persists.'
            },
            {
              problem: 'Features not unlocking after activation',
              solution: 'Clear browser cache and refresh page. Logout and login again. Check license status in admin panel.'
            },
            {
              problem: 'Cannot access premium features',
              solution: 'Verify license is Professional or Enterprise. Check license expiry date. Contact admin to upgrade plan.'
            },
            {
              problem: 'Branch not showing in dropdown',
              solution: 'Ensure branch is marked as active. Check user role is branch_manager. Refresh page after creating branch.'
            },
            {
              problem: 'Payment not processing',
              solution: 'Check payment details are correct. Ensure sufficient funds. Try different card. Contact bank if declined.'
            }
          ]
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Contact',
      icon: Phone,
      color: 'from-blue-500 to-indigo-500',
      items: [
        {
          title: 'Get Help',
          description: 'Multiple ways to reach us',
          channels: [
            {
              icon: Mail,
              title: 'Email Support',
              value: 'support@selmartt.com',
              description: 'Response within 24 hours'
            },
            {
              icon: Phone,
              title: 'Phone Support',
              value: '+233 XX XXX XXXX',
              description: 'Enterprise customers only'
            },
            {
              icon: Globe,
              title: 'Website',
              value: 'www.selmartt.com',
              description: 'Visit our website'
            }
          ]
        },
        {
          title: 'Support Levels',
          description: 'Support based on your plan',
          levels: [
            { plan: 'Basic', support: 'Email support (48h response)' },
            { plan: 'Professional', support: 'Priority email (24h response)' },
            { plan: 'Enterprise', support: 'Phone + email + dedicated manager (1h response)' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <BookOpen size={64} className="mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">System Documentation</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Complete guide to using the Warehouse Management System. Everything you need to know in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#getting-started" className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transition-all">
              Get Started
            </a>
            <a href="#support" className="px-8 py-3 bg-white/10 backdrop-blur-xl border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
              >
                <section.icon size={20} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {section.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {sections.map((section, idx) => (
          <div key={section.id} id={section.id} className="mb-16 scroll-mt-20">
            
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-xl`}>
                <section.icon size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">Section {idx + 1} of {sections.length}</p>
              </div>
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{item.description}</p>

                  {/* Steps */}
                  {item.steps && (
                    <div className="space-y-3">
                      {item.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                            {stepIdx + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Permissions */}
                  {item.permissions && (
                    <div className="space-y-2">
                      {item.permissions.map((permission, permIdx) => (
                        <div key={permIdx} className="flex items-center gap-3">
                          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                          <p className="text-gray-700 dark:text-gray-300">{permission}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Features */}
                  {item.features && (
                    <div className="grid md:grid-cols-2 gap-3">
                      {item.features.map((feature, featIdx) => (
                        <div key={featIdx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <Sparkles size={16} className="text-blue-500 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">{feature}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plans */}
                  {item.plans && (
                    <div className="grid md:grid-cols-3 gap-4">
                      {item.plans.map((plan, planIdx) => (
                        <div key={planIdx} className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                          <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h4>
                          <p className="text-blue-600 dark:text-blue-400 font-bold mb-4">{plan.price}</p>
                          <div className="space-y-2">
                            {plan.features.map((feature, featIdx) => (
                              <div key={featIdx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Issues */}
                  {item.issues && (
                    <div className="space-y-4">
                      {item.issues.map((issue, issueIdx) => (
                        <div key={issueIdx} className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-r-lg">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">❌ {issue.problem}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Solution:</strong> {issue.solution}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Channels */}
                  {item.channels && (
                    <div className="grid md:grid-cols-3 gap-4">
                      {item.channels.map((channel, chanIdx) => (
                        <div key={chanIdx} className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                          <channel.icon size={32} className="text-blue-600 dark:text-blue-400 mb-3" />
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">{channel.title}</h4>
                          <p className="text-blue-600 dark:text-blue-400 font-mono text-sm mb-2">{channel.value}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{channel.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Support Levels */}
                  {item.levels && (
                    <div className="space-y-3">
                      {item.levels.map((level, levelIdx) => (
                        <div key={levelIdx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="font-bold text-gray-900 dark:text-white">{level.plan}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{level.support}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Need More Help?</h2>
          <p className="text-xl text-white/90 mb-8">
            Our support team is here to assist you
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:support@selmartt.com" className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transition-all">
              Email Support
            </a>
            <Link href="/admin" className="px-8 py-3 bg-white/10 backdrop-blur-xl border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}