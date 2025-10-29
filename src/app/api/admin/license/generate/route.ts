import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import { generateLicenseKey, getLicenseFeatures, getLicenseLimits, generateLicenseSignature } from '@/lib/utils/licenseGenerator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can generate licenses
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      clientName, 
      clientEmail, 
      clientCompany,
      licenseType,
      expiryDate,
      amount,
      notes 
    } = await req.json();

    // Validation
    if (!clientName || !clientEmail || !licenseType) {
      return NextResponse.json(
        { error: 'Client name, email, and license type are required' },
        { status: 400 }
      );
    }

    if (!['basic', 'professional', 'enterprise'].includes(licenseType)) {
      return NextResponse.json(
        { error: 'Invalid license type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique license key
    const licenseKey = generateLicenseKey(clientEmail, licenseType);

    // Get features and limits for this license type
    const features = getLicenseFeatures(licenseType);
    const limits = getLicenseLimits(licenseType);

    // Prepare license data
    const licenseData = {
      licenseKey,
      clientName,
      clientEmail,
      clientCompany,
      licenseType,
      features,
      maxBranches: limits.maxBranches,
      maxUsers: limits.maxUsers,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      amount: amount || 0,
      notes,
      status: 'active'
    };

    // Generate signature
    const signature = generateLicenseSignature(licenseData);

    // Create license with signature
    const license = await License.create({
      ...licenseData,
      signature
    });

    console.log(`✅ License generated: ${licenseKey} for ${clientEmail}`);

    return NextResponse.json({
      success: true,
      message: 'License generated successfully',
      license: {
        licenseKey,
        clientName,
        clientEmail,
        licenseType,
        features,
        expiryDate: license.expiryDate
      }
    });

  } catch (error: any) {
    console.error('License generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}