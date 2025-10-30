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

function getDefaultAmount(licenseType: string, billingCycle: 'monthly' | 'yearly' = 'yearly'): number {
  return LICENSE_PRICES[licenseType as keyof typeof LICENSE_PRICES]?.[billingCycle] || 0;
}

function calculateNewAmount(
  currentType: string,
  newType: string,
  currentAmount: number | undefined,
  billingCycle: 'monthly' | 'yearly' = 'yearly'
): number {
  // If current amount is missing, use default price for current type
  const actualCurrentAmount = currentAmount || getDefaultAmount(currentType, billingCycle);
  
  const currentPrice = LICENSE_PRICES[currentType as keyof typeof LICENSE_PRICES]?.[billingCycle] || 0;
  const newPrice = LICENSE_PRICES[newType as keyof typeof LICENSE_PRICES]?.[billingCycle] || 0;
  
  // Calculate difference and add to current amount
  const difference = newPrice - currentPrice;
  
  return actualCurrentAmount + difference;
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
    const currentAmount = license.amount; // May be undefined

    // Detect billing cycle
    let billingCycle: 'monthly' | 'yearly' = 'yearly';
    
    if (currentAmount) {
      // Detect from amount
      if (currentType === 'basic' && currentAmount === 19) billingCycle = 'monthly';
      else if (currentType === 'professional' && currentAmount === 49) billingCycle = 'monthly';
      else if (currentType === 'enterprise' && currentAmount === 149) billingCycle = 'monthly';
    }
    
    // Check notes
    if (license.notes?.toLowerCase().includes('monthly')) billingCycle = 'monthly';
    if (license.notes?.toLowerCase().includes('yearly')) billingCycle = 'yearly';

    // Calculate amounts
    const oldAmount = currentAmount || getDefaultAmount(currentType, billingCycle);
    const newAmount = calculateNewAmount(currentType, newLicenseType, currentAmount, billingCycle);
    const amountDifference = newAmount - oldAmount;

    // Update license
    const features = getLicenseFeatures(newLicenseType);
    const limits = getLicenseLimits(newLicenseType);

    license.licenseType = newLicenseType;
    license.features = features;
    license.maxBranches = limits.maxBranches;
    license.maxUsers = limits.maxUsers;
    license.amount = newAmount;
    license.notes = (license.notes || '') + 
      `\n[${new Date().toISOString()}] Upgraded from ${currentType} ($${oldAmount.toFixed(2)}) to ${newLicenseType} ($${newAmount.toFixed(2)}) by ${session.user.name}. Billing: ${billingCycle}. Amount added: $${amountDifference.toFixed(2)}`;

    // Regenerate signature
    try {
      license.signature = generateLicenseSignature(license);
    } catch (error) {
      console.error('Failed to generate signature:', error);
    }

    await license.save();

    console.log(`✅ License upgraded: ${license.licenseKey} → ${newLicenseType} ($${oldAmount} → $${newAmount})`);

    return NextResponse.json({
      success: true,
      message: 'License upgraded successfully',
      licenseType: newLicenseType,
      oldAmount: parseFloat(oldAmount.toFixed(2)),
      newAmount: parseFloat(newAmount.toFixed(2)),
      amountAdded: parseFloat(amountDifference.toFixed(2))
    });

  } catch (error: any) {
    console.error('License upgrade error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}