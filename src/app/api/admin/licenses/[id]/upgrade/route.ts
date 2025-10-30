import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import { getLicenseFeatures, getLicenseLimits, generateLicenseSignature } from '@/lib/utils/licenseGenerator';

export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newLicenseType } = await req.json();

    if (!['basic', 'professional', 'enterprise'].includes(newLicenseType)) {
      return NextResponse.json({ error: 'Invalid license type' }, { status: 400 });
    }

    await connectDB();

    const license = await License.findById(params.id);

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Update license
    const features = getLicenseFeatures(newLicenseType);
    const limits = getLicenseLimits(newLicenseType);

    license.licenseType = newLicenseType;
    license.features = features;
    license.maxBranches = limits.maxBranches;
    license.maxUsers = limits.maxUsers;
    license.notes = (license.notes || '') + `\n[${new Date().toISOString()}] Upgraded to ${newLicenseType} by ${session.user.name}`;

    // Regenerate signature
    try {
      license.signature = generateLicenseSignature(license);
    } catch (error) {
      console.error('Failed to generate signature:', error);
    }

    await license.save();

    console.log(`✅ License upgraded: ${license.licenseKey} → ${newLicenseType}`);

    return NextResponse.json({
      success: true,
      message: 'License upgraded successfully',
      licenseType: newLicenseType
    });

  } catch (error: any) {
    console.error('License upgrade error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}