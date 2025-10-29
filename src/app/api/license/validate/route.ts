import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import SystemSettings from '@/lib/db/models/SystemSettings';
import { validateLicenseFormat } from '@/lib/utils/licenseGenerator';
import { verifyLicenseSignature } from '@/lib/utils/licenseGenerator';

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, domain } = await req.json();

    if (!licenseKey || !validateLicenseFormat(licenseKey)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid license key format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if this license is already activated
    const existingActivation = await SystemSettings.findOne({
      settingKey: 'active_license'
    });

    if (existingActivation) {
      // License already activated for this domain
      const activatedLicense = await License.findOne({ 
        licenseKey: existingActivation.settingValue 
      });

      if (activatedLicense) {
        // Return the existing activated license
        return NextResponse.json({
          valid: true,
          alreadyActivated: true,
          license: {
            type: activatedLicense.licenseType,
            features: activatedLicense.features,
            maxBranches: activatedLicense.maxBranches,
            maxUsers: activatedLicense.maxUsers,
            expiryDate: activatedLicense.expiryDate,
            clientName: activatedLicense.clientName,
            addons: activatedLicense.addons
          }
        });
      }
    }

    // Find the license
    const license = await License.findOne({ licenseKey });

    if (!license) {
      return NextResponse.json(
        { valid: false, error: 'License key not found' },
        { status: 404 }
      );
    }
    // VERIFY SIGNATURE
if (!verifyLicenseSignature(license, license.signature)) {
  console.error('⚠️ License signature verification failed - possible tampering!');
  return NextResponse.json(
    { valid: false, error: 'License signature invalid - possible tampering detected' },
    { status: 403 }
  );
}


    // Check if this license is already used
    if (license.installationDomain && license.installationDomain !== domain) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `This license is already activated on another domain: ${license.installationDomain}` 
        },
        { status: 403 }
      );
    }

    // Check if expired
    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      return NextResponse.json(
        { valid: false, error: 'License has expired' },
        { status: 403 }
      );
    }

    // Check if suspended
    if (license.status === 'suspended') {
      return NextResponse.json(
        { valid: false, error: 'License has been suspended' },
        { status: 403 }
      );
    }

    // ACTIVATE THE LICENSE (First time activation)
    license.installationDomain = domain;
    license.installCount += 1;
    license.lastValidated = new Date();
    license.status = 'active';
    await license.save();

    // Store in system settings (DATABASE - not localStorage)
    await SystemSettings.findOneAndUpdate(
      { settingKey: 'active_license' },
      { 
        settingKey: 'active_license',
        settingValue: licenseKey,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log(`✅ License activated for domain: ${domain}`);

    return NextResponse.json({
      valid: true,
      activated: true,
      license: {
        type: license.licenseType,
        features: license.features,
        maxBranches: license.maxBranches,
        maxUsers: license.maxUsers,
        expiryDate: license.expiryDate,
        clientName: license.clientName,
        addons: license.addons
      }
    });

  } catch (error: any) {
    console.error('License validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}