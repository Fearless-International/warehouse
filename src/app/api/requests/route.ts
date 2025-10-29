import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import User from '@/lib/db/models/User';
import { detectAnomalies } from '@/lib/services/anomalyDetection';
import { createNotification } from '@/lib/services/notificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'branch_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json();

    await connectDB();

    // Generate request number
    const count = await Request.countDocuments();
    const requestNumber = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const request = await Request.create({
      requestNumber,
      branchId: session.user.branchId,
      requestedBy: session.user.id,
      items,
      status: 'pending',
      submittedAt: new Date()
    });

    // Find all warehouse managers to notify
    const warehouseManagers = await User.find({ 
      role: 'warehouse_manager',
      isActive: true 
    }).lean();

    // Send notification to all warehouse managers
    for (const manager of warehouseManagers) {
      await createNotification({
        recipientId: manager._id.toString(),
        type: 'request_submitted',
        title: `New Request: ${requestNumber}`,
        message: `${session.user.name} from ${session.user.branchName || 'Branch'} submitted a new request with ${items.length} item(s). Please review.`,
        relatedEntityType: 'request',
        relatedEntityId: request._id.toString()
      });
    }

    // Run anomaly detection in background (don't wait)
    detectAnomalies(request._id.toString()).catch(err => 
      console.error('Anomaly detection error:', err)
    );

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}