import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/lib/db/models/Notification';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { recipientId: session.user.id, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}