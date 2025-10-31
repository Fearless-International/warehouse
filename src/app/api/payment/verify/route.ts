import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import { generateLicenseKey, getLicenseFeatures, getLicenseLimits, generateLicenseSignature } from '@/lib/utils/licenseGenerator';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reference = req.nextUrl.searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment verification failed' 
      }, { status: 400 });
    }

    // Payment successful - generate license
    const { amount, metadata } = data.data;
    const planType = metadata.plan_type;
    const billingCycle = metadata.billing_cycle;

    await connectDB();

    // Check if license already generated for this payment
    const existingLicense = await License.findOne({ 
      purchaseId: reference 
    });

    if (existingLicense) {
      return NextResponse.json({
        success: true,
        licenseKey: existingLicense.licenseKey,
        message: 'License already generated'
      });
    }

    // Generate new license
    const licenseKey = generateLicenseKey(session.user.email!, planType);
    const features = getLicenseFeatures(planType);
    const limits = getLicenseLimits(planType);

    const licenseData = {
      licenseKey,
      clientName: session.user.name!,
      clientEmail: session.user.email!,
      licenseType: planType,
      features,
      maxBranches: limits.maxBranches,
      maxUsers: limits.maxUsers,
      amount: amount / 100, // Convert from kobo to main currency
      status: 'active',
      purchaseId: reference,
      expiryDate: billingCycle === 'yearly' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: `Purchased via Paystack. Billing: ${billingCycle}`
    };

    const signature = generateLicenseSignature(licenseData);

    await License.create({
      ...licenseData,
      signature
    });

    console.log(`✅ License generated after payment: ${licenseKey}`);

    // TODO: Send email with license key

    return NextResponse.json({
      success: true,
      licenseKey,
      message: 'License generated successfully'
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}