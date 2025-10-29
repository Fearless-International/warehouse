import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import { createNotification } from '@/lib/services/notificationService';

export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'branch_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { branchResponse } = await req.json();

    if (!branchResponse) {
      return NextResponse.json({ error: 'Response is required' }, { status: 400 });
    }

    await connectDB();

    const query = await AnomalyQuery.findById(params.id)
      .populate('queriedBy')
      .populate('requestId');

    if (!query) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    // Check if query belongs to this branch
    if (query.branchId.toString() !== session.user.branchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (query.status !== 'pending') {
      return NextResponse.json(
        { error: 'This query has already been responded to' },
        { status: 400 }
      );
    }

    // Update query
    query.branchResponse = branchResponse;
    query.status = 'responded';
    query.respondedAt = new Date();
    await query.save();

    // 🔔 NOTIFY WAREHOUSE MANAGER WHO SENT THE QUERY
    await createNotification({
      recipientId: query.queriedBy._id.toString(),
      type: 'query_response',
      title: '✅ Branch Manager Responded',
      message: `${session.user.name} has responded to your query about request ${query.requestId.requestNumber}.`,
      relatedEntityType: 'anomaly_query',
      relatedEntityId: query._id.toString()
    });

    console.log(`✅ Branch response saved and warehouse manager notified`);

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully. Warehouse has been notified.',
      query
    });

  } catch (error: any) {
    console.error('Respond to query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}