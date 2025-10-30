import { NextRequest, NextResponse } from 'next/server';
import { checkLicenseHeartbeat } from '@/lib/utils/licenseHeartbeat';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Admin bypass
    if (session?.user.role === 'admin') {
      return NextResponse.json({ valid: true });
    }

    const result = await checkLicenseHeartbeat();
    
    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        reason: result.reason
      }, { status: 200 }); // ✅ Changed from 403 to 200
    }

    return NextResponse.json({ valid: true });

  } catch (error: any) {
    console.error('Heartbeat API error:', error);
    return NextResponse.json({
      valid: true // ✅ Return true on error to avoid blocking
    }, { status: 200 });
  }
}