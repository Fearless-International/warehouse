// Feature definitions and pricing
export const FEATURES = {
  // Core features (included in all plans)
  core: [
    'dashboard',
    'basicRequests',
    'basicProducts',
    'basicBranches',
    'basicUsers',
    'notifications',
    'basicReports'
  ],

  // Professional features
  professional: [
    'anomalyDetection',
    'advancedAnalytics',
    'customReports',
    'querySystem',
    'mobilePWA'
  ],

  // Enterprise features
  enterprise: [
    'whiteLabel',
    'apiAccess',
    'smsNotifications',
    'multiWarehouse',
    'dedicatedSupport'
  ]
};

// Addon pricing
export const ADDONS = {
  advancedReporting: {
    name: 'Advanced Reporting Module',
    price: 197,
    description: 'Custom date ranges, multiple formats, automated scheduling',
    feature: 'customReports'
  },
  mobilePWA: {
    name: 'Mobile PWA App',
    price: 97,
    description: 'Installable mobile app with offline support',
    feature: 'mobilePWA'
  },
  smsNotifications: {
    name: 'SMS Notifications',
    price: 147,
    description: 'Send SMS alerts for critical events',
    feature: 'smsNotifications'
  },
  apiAccess: {
    name: 'REST API Access',
    price: 247,
    description: 'Full API access for custom integrations',
    feature: 'apiAccess'
  },
  customBranding: {
    name: 'White Label / Custom Branding',
    price: 397,
    description: 'Remove branding and add your own',
    feature: 'whiteLabel'
  },
  multiWarehouse: {
    name: 'Multi-Warehouse Support',
    price: 497,
    description: 'Manage multiple warehouses',
    feature: 'multiWarehouse'
  }
};

// Plan pricing
export const PLANS = {
  basic: {
    name: 'Basic',
    price: 297,
    description: 'Perfect for small businesses',
    features: FEATURES.core,
    maxBranches: 5,
    maxUsers: 10
  },
  professional: {
    name: 'Professional',
    price: 597,
    description: 'For growing businesses',
    features: [...FEATURES.core, ...FEATURES.professional],
    maxBranches: 20,
    maxUsers: 50
  },
  enterprise: {
    name: 'Enterprise',
    price: 1497,
    description: 'For large organizations',
    features: [...FEATURES.core, ...FEATURES.professional, ...FEATURES.enterprise],
    maxBranches: 999,
    maxUsers: 999
  }
};

// Check if user can access a feature
export function canAccessFeature(license: any, featureName: string): boolean {
  if (!license) return false;

  // Core features always available
  if (FEATURES.core.includes(featureName)) return true;

  // Check license features
  return license.features && license.features[featureName] === true;
}