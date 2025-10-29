import { NextRequest, NextResponse } from 'next/server';
import { checkLicenseHeartbeat } from '@/lib/utils/licenseHeartbeat';

export async function GET(req: NextRequest) {
  try {
    const result = await checkLicenseHeartbeat();
    
    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        reason: result.reason,
        action: 'redirect_to_activate'
      }, { status: 403 });
    }

    return NextResponse.json({ valid: true });

  } catch (error: any) {
    console.error('Heartbeat API error:', error);
    return NextResponse.json({
      valid: false,
      reason: 'Server error'
    }, { status: 500 });
  }
}