import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Complaint from '@/lib/db/models/Complaint';
import { createNotification } from '@/lib/services/notificationService';

export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || !['warehouse_manager', 'admin', 'hr'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { response, status } = await req.json();

    await connectDB();

    const complaint = await Complaint.findByIdAndUpdate(
      params.id,
      {
        response,
        status,
        respondedBy: session.user.id,
        respondedAt: new Date()
      },
      { new: true }
    ).populate('submittedBy branchId');

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Notify the branch manager who submitted the complaint
    await createNotification({
      recipientId: complaint.submittedBy._id.toString(),
      type: 'complaint',
      title: '✅ Complaint Response Received',
      message: `Your complaint "${complaint.subject}" has been updated to: ${status}`,
      relatedEntityType: 'complaint',
      relatedEntityId: complaint._id.toString()
    });

    return NextResponse.json(complaint);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}