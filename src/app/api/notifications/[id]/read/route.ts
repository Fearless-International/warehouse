import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { markAsRead } from '@/lib/services/notificationService';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 change this
) {
  try {
    const { id } = await context.params; // 👈 await params

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await markAsRead(id);

    return NextResponse.json(notification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
