import crypto from 'crypto';
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'your-secret-key-change-in-production';
export function generateLicenseKey(
  clientEmail: string,
  licenseType: string
): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  const hash = crypto
    .createHash('sha256')
    .update(`${clientEmail}-${licenseType}-${timestamp}`)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  // Format: XXXX-XXXX-XXXX-XXXX
  const key = `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${random.substring(0, 4)}-${timestamp.substring(0, 4)}`;
  
  return key;
}

export function validateLicenseFormat(key: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}

// Generate signature for license data
export function generateLicenseSignature(licenseData: any): string {
  const dataString = JSON.stringify({
    licenseKey: licenseData.licenseKey,
    clientEmail: licenseData.clientEmail,
    licenseType: licenseData.licenseType,
    expiryDate: licenseData.expiryDate
  });

  return crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(dataString)
    .digest('hex');
}

export function verifyLicenseSignature(licenseData: any, signature: string): boolean {
  const dataString = JSON.stringify({
    licenseKey: licenseData.licenseKey,
    clientEmail: licenseData.clientEmail,
    licenseType: licenseData.licenseType,
    expiryDate: licenseData.expiryDate
  });

  const expectedSignature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(dataString)
    .digest('hex');

  return expectedSignature === signature;
}

// Get license features based on type
export function getLicenseFeatures(licenseType: 'basic' | 'professional' | 'enterprise') {
  const features = {
    basic: {
      anomalyDetection: false,
      advancedAnalytics: false,
      customReports: false,
      querySystem: false,
      mobilePWA: false,
      apiAccess: false,
      whiteLabel: false,
      smsNotifications: false,
      multiWarehouse: false,
    },
    professional: {
      anomalyDetection: true,
      advancedAnalytics: true,
      customReports: true,
      querySystem: true,
      mobilePWA: true,
      apiAccess: false,
      whiteLabel: false,
      smsNotifications: false,
      multiWarehouse: false,
    },
    enterprise: {
      anomalyDetection: true,
      advancedAnalytics: true,
      customReports: true,
      querySystem: true,
      mobilePWA: true,
      apiAccess: true,
      whiteLabel: true,
      smsNotifications: true,
      multiWarehouse: true,
    }
  };

  return features[licenseType];
}

// Get max limits based on license type
export function getLicenseLimits(licenseType: 'basic' | 'professional' | 'enterprise') {
  const limits = {
    basic: { maxBranches: 5, maxUsers: 10 },
    professional: { maxBranches: 20, maxUsers: 50 },
    enterprise: { maxBranches: 999, maxUsers: 999 }
  };

  return limits[licenseType];
}