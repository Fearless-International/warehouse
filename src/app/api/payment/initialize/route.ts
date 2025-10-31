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

    const body = await req.json();
    const { email, amount, plan, billingCycle, metadata } = body;

    // Validation
    if (!email || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: email and amount are required' 
      }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json({ 
        error: 'Payment gateway not configured' 
      }, { status: 500 });
    }

    // Amount should already be in kobo from frontend (multiplied by 100)
    const amountInKobo = Math.round(Number(amount));

    if (isNaN(amountInKobo) || amountInKobo <= 0) {
      return NextResponse.json({ 
        error: 'Invalid amount' 
      }, { status: 400 });
    }

    // Get the actual domain from request headers
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    console.log('Initializing payment:', {
      email,
      amountInKobo,
      plan,
      billingCycle,
      baseUrl
    });

    // Initialize Paystack payment
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo, // Already in kobo from frontend
        currency: 'GHS', // Ghana Cedis
        callback_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
        metadata: {
          ...metadata,
          plan,
          billingCycle,
          user_id: session.user.id,
          user_email: session.user.email
        }
      })
    });

    const data = await response.json();

    console.log('Paystack response:', data);

    if (data.status) {
      return NextResponse.json({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference
      });
    } else {
      console.error('Paystack error:', data);
      return NextResponse.json({ 
        error: data.message || 'Payment initialization failed',
        details: data
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
}