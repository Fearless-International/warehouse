import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import SystemSettings from '@/lib/db/models/SystemSettings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get active license from system settings
    const activeLicense = await SystemSettings.findOne({
      settingKey: 'active_license'
    });

    if (!activeLicense) {
      return NextResponse.json({
        active: false,
        license: {
          type: 'basic',
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
          },
          maxBranches: 5,
          maxUsers: 10
        }
      });
    }

    // Get full license details
    const license = await License.findOne({ 
      licenseKey: activeLicense.settingValue 
    });

    if (!license) {
      return NextResponse.json({
        active: false,
        license: null
      });
    }

    // Check if expired
    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      return NextResponse.json({
        active: false,
        expired: true,
        license: null
      });
    }

    // Check if suspended
    if (license.status === 'suspended') {
      return NextResponse.json({
        active: false,
        suspended: true,
        license: null
      });
    }

    // Update last validated
    license.lastValidated = new Date();
    await license.save();

    return NextResponse.json({
      active: true,
      license: {
        type: license.licenseType,
        features: license.features,
        maxBranches: license.maxBranches,
        maxUsers: license.maxUsers,
        expiryDate: license.expiryDate,
        clientName: license.clientName
      }
    });

  } catch (error: any) {
    console.error('License check error:', error);
    return NextResponse.json({
      active: false,
      error: error.message
    }, { status: 500 });
  }
}