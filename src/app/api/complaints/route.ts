import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Complaint from '@/lib/db/models/Complaint';
import User from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'branch_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, category, description } = await req.json();

    await connectDB();

    const complaint = await Complaint.create({
      branchId: session.user.branchId,
      submittedBy: session.user.id,
      subject,
      category,
      description,
      status: 'open',
      priority: 'medium'
    });

    // Notify Warehouse Manager, Admin, and HR
    const recipients = await User.find({
      role: { $in: ['warehouse_manager', 'admin', 'hr'] },
      isActive: true
    }).lean();

    for (const recipient of recipients) {
      await createNotification({
        recipientId: recipient._id.toString(),
        type: 'complaint',
        title: '📋 New Complaint Submitted',
        message: `${session.user.branchName} - ${subject}`,
        relatedEntityType: 'complaint',
        relatedEntityId: complaint._id.toString()
      });
    }

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}