import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import { getLicenseFeatures, getLicenseLimits, generateLicenseSignature } from '@/lib/utils/licenseGenerator';
// Price mapping
const LICENSE_PRICES = {
  basic: {
    monthly: 19,
    yearly: 197
  },
  professional: {
    monthly: 49,
    yearly: 497
  },
  enterprise: {
    monthly: 149,
    yearly: 1497
  }
};
function calculateUpgradeAmount(
  currentType: string,
  newType: string,
  currentAmount: number,
  billingCycle: 'monthly' | 'yearly' = 'yearly'
): number {
  const currentPrice = LICENSE_PRICES[currentType as keyof typeof LICENSE_PRICES]?.[billingCycle] || 0;
  const newPrice = LICENSE_PRICES[newType as keyof typeof LICENSE_PRICES]?.[billingCycle] || 0;
  
  // If upgrading, calculate the difference
  const difference = newPrice - currentPrice;
  
  // Add the difference to existing amount
  return currentAmount + difference;
}
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
const currentType = license.licenseType;
    const currentAmount = license.amount || 0;

    // Detect billing cycle from existing license
    let billingCycle: 'monthly' | 'yearly' = 'yearly';
    
    // Smart detection based on current amount
    if (currentType === 'basic' && currentAmount === 19) billingCycle = 'monthly';
    else if (currentType === 'professional' && currentAmount === 49) billingCycle = 'monthly';
    else if (currentType === 'enterprise' && currentAmount === 149) billingCycle = 'monthly';
    
    // Or check notes for billing cycle
    if (license.notes?.includes('monthly')) billingCycle = 'monthly';
    if (license.notes?.includes('yearly')) billingCycle = 'yearly';

    // Calculate new amount
    const newAmount = calculateUpgradeAmount(
      currentType,
      newLicenseType,
      currentAmount,
      billingCycle
    );
    // Update license
    const features = getLicenseFeatures(newLicenseType);
    const limits = getLicenseLimits(newLicenseType);

    license.licenseType = newLicenseType;
    license.features = features;
    license.maxBranches = limits.maxBranches;
    license.maxUsers = limits.maxUsers;
    license.amount = newAmount; // ✅ Update amount
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