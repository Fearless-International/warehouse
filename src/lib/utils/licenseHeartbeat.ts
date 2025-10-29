import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import SystemSettings from '@/lib/db/models/SystemSettings';

export async function checkLicenseHeartbeat(): Promise<{
  valid: boolean;
  reason?: string;
}> {
  try {
    await connectDB();

    // Get last heartbeat check
    const lastCheck = await SystemSettings.findOne({
      settingKey: 'last_license_check'
    });

    const now = new Date();
    
    // If checked within last 24 hours, skip
    if (lastCheck && lastCheck.updatedAt) {
      const hoursSinceCheck = (now.getTime() - new Date(lastCheck.updatedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCheck < 24) {
        return { valid: true };
      }
    }

    // Get active license
    const activeLicense = await SystemSettings.findOne({
      settingKey: 'active_license'
    });

    if (!activeLicense) {
      return { valid: false, reason: 'No active license' };
    }

    // Verify license still valid
    const license = await License.findOne({ 
      licenseKey: activeLicense.settingValue 
    });

    if (!license) {
      return { valid: false, reason: 'License not found' };
    }

    // Check expiry
    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      // Deactivate expired license
      await SystemSettings.deleteOne({ settingKey: 'active_license' });
      return { valid: false, reason: 'License expired' };
    }

    // Check suspension
    if (license.status === 'suspended') {
      await SystemSettings.deleteOne({ settingKey: 'active_license' });
      return { valid: false, reason: 'License suspended' };
    }

    // Update last check time
    await SystemSettings.findOneAndUpdate(
      { settingKey: 'last_license_check' },
      { 
        settingKey: 'last_license_check',
        settingValue: now.toISOString(),
        updatedAt: now
      },
      { upsert: true }
    );

    // Update license last validated
    license.lastValidated = now;
    await license.save();

    console.log('✅ License heartbeat check passed');
    return { valid: true };

  } catch (error) {
    console.error('License heartbeat error:', error);
    return { valid: false, reason: 'Heartbeat check failed' };
  }
}