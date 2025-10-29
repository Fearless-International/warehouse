import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import Request from '@/lib/db/models/Request';
import { createNotification } from '@/lib/services/notificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['warehouse_manager', 'admin', 'hr'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, branchId, anomalyDetails, queryMessage } = await req.json();

    if (!requestId || !queryMessage) {
      return NextResponse.json(
        { error: 'Request ID and query message are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get request details to find branch manager
    const request = await Request.findById(requestId)
      .populate('requestedBy')
      .lean();

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Create query
    const query = await AnomalyQuery.create({
      requestId,
      branchId,
      queriedBy: session.user.id,
      anomalyDetails: anomalyDetails || [],
      queryMessage,
      status: 'pending'
    });

    // 🔔 SEND NOTIFICATION TO BRANCH MANAGER
    await createNotification({
      recipientId: request.requestedBy._id.toString(),
      type: 'anomaly_query',
      title: '❓ Question About Your Order',
      message: `The warehouse has a question about your request ${request.requestNumber}. Please respond to help us understand your needs.`,
      relatedEntityType: 'anomaly_query',
      relatedEntityId: query._id.toString()
    });

    console.log(`✅ Query sent and notification created for branch manager`);

    return NextResponse.json({
      success: true,
      message: 'Query sent successfully. Branch manager has been notified.',
      query
    });

  } catch (error: any) {
    console.error('Create query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}