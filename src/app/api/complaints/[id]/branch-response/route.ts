import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Complaint from '@/lib/db/models/Complaint';
import User from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notificationService';

export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'branch_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectDB();

    const complaint = await Complaint.findById(params.id).populate('branchId');

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check if complaint is closed
    if (complaint.status === 'closed') {
      return NextResponse.json({ error: 'Cannot respond to closed complaint' }, { status: 400 });
    }

    // Initialize conversation array if it doesn't exist
    if (!complaint.conversation) {
      complaint.conversation = [];
    }

    // Add to conversation
    complaint.conversation.push({
      message: message.trim(),
      sender: session.user.id,
      timestamp: new Date()
    });

    await complaint.save();

    // Notify warehouse manager, admin, and HR
    const recipients = await User.find({
      role: { $in: ['warehouse_manager', 'admin', 'hr'] },
      isActive: true
    }).lean();

    for (const recipient of recipients) {
      await createNotification({
        recipientId: recipient._id.toString(),
        type: 'complaint',
        title: '💬 New Response on Complaint',
        message: `${complaint.branchId.name} responded to: ${complaint.subject}`,
        relatedEntityType: 'complaint',
        relatedEntityId: complaint._id.toString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Branch response error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}