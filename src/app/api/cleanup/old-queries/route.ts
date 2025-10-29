import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import Notification from '@/lib/db/models/Notification';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'warehouse_manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Delete answered queries older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const queryResult = await AnomalyQuery.deleteMany({
      status: { $in: ['responded', 'resolved'] },
      respondedAt: { $lt: thirtyDaysAgo }
    });

    // Also delete related notifications
    const notifResult = await Notification.deleteMany({
      type: { $in: ['anomaly_query', 'query_response'] },
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });

    console.log(`Cleaned up ${queryResult.deletedCount} queries and ${notifResult.deletedCount} notifications`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${queryResult.deletedCount} old queries and ${notifResult.deletedCount} notifications`,
      queriesDeleted: queryResult.deletedCount,
      notificationsDeleted: notifResult.deletedCount
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}