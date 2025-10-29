import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import SystemSettings from '@/lib/db/models/SystemSettings';

export async function checkServerLicense() {
  try {
    await connectDB();

    // Get active license from system settings
    const activeLicense = await SystemSettings.findOne({
      settingKey: 'active_license'
    });

    if (!activeLicense) {
      return {
        active: false,
        type: 'basic' as const,
        features: {
          anomalyDetection: false,
          advancedAnalytics: false,
          customReports: false,
          querySystem: false,
          mobilePWA: false,
          apiAccess: false,
          whiteLabel: false,
          smsNotifications: false,
          multiWarehouse: false,
        }
      };
    }

    // Get full license details
    const license = await License.findOne({ 
      licenseKey: activeLicense.settingValue 
    }).lean();

    if (!license) {
      return { 
        active: false, 
        type: 'basic' as const,
        features: {
          anomalyDetection: false,
          advancedAnalytics: false,
          customReports: false,
          querySystem: false,
          mobilePWA: false,
          apiAccess: false,
          whiteLabel: false,
          smsNotifications: false,
          multiWarehouse: false,
        }
      };
    }

    // Check if expired
    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      return { 
        active: false, 
        type: 'basic' as const, 
        expired: true,
        features: {
          anomalyDetection: false,
          advancedAnalytics: false,
          customReports: false,
          querySystem: false,
          mobilePWA: false,
          apiAccess: false,
          whiteLabel: false,
          smsNotifications: false,
          multiWarehouse: false,
        }
      };
    }

    // Check if suspended
    if (license.status === 'suspended') {
      return { 
        active: false, 
        type: 'basic' as const, 
        suspended: true,
        features: {
          anomalyDetection: false,
          advancedAnalytics: false,
          customReports: false,
          querySystem: false,
          mobilePWA: false,
          apiAccess: false,
          whiteLabel: false,
          smsNotifications: false,
          multiWarehouse: false,
        }
      };
    }

    return {
      active: true,
      type: license.licenseType,
      features: license.features,
      maxBranches: license.maxBranches,
      maxUsers: license.maxUsers
    };

  } catch (error) {
    console.error('Server license check error:', error);
    return { 
      active: false, 
      type: 'basic' as const,
      features: {
        anomalyDetection: false,
        advancedAnalytics: false,
        customReports: false,
        querySystem: false,
        mobilePWA: false,
        apiAccess: false,
        whiteLabel: false,
        smsNotifications: false,
        multiWarehouse: false,
      }
    };
  }
}