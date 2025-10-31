import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, amount, plan, billingCycle, metadata } = await req.json();

    // Initialize Paystack payment
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount, // In kobo/cents
        currency: 'GHS', // Ghana Cedis - change if needed
        callback_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
        metadata: {
          ...metadata,
          user_id: session.user.id,
          cancel_action: `${process.env.NEXTAUTH_URL}/pricing`
        }
      })
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference
      });
    } else {
      return NextResponse.json({ error: 'Payment initialization failed' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}