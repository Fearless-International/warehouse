import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Branch from '@/lib/db/models/Branch';
import Message from '@/lib/db/models/Message';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (session.user.role === 'warehouse_manager') {
      // Get all branch managers
      const branchManagers = await User.find({ 
        role: 'branch_manager',
        isActive: true 
      }).populate('branchId').lean();

      const conversations = await Promise.all(
        branchManagers.map(async (manager: any) => {
          const ids = [session.user.id, manager._id.toString()].sort();
          const conversationId = `${ids[0]}_${ids[1]}`;
          
          const lastMessage = await Message.findOne({ conversationId })
            .sort({ createdAt: -1 })
            .lean();

          return {
            _id: manager._id.toString(),
            userId: manager._id.toString(),
            branchName: manager.branchId?.name,
            managerName: manager.name,
            lastMessage: lastMessage?.message,
            lastMessageDate: lastMessage?.createdAt
          };
        })
      );

      return NextResponse.json(conversations);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}