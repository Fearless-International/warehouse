import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Message from '@/lib/db/models/Message';
import User from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    await connectDB();

    if (conversationId) {
      const messages = await Message.find({ conversationId })
        .populate('senderId', 'name role')
        .populate('receiverId', 'name role')
        .sort({ createdAt: 1 })
        .lean();

      return NextResponse.json(messages);
    }

    // Get all conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, message, relatedEntityType, relatedEntityId } = await req.json();

    await connectDB();

    // Create conversation ID (sorted user IDs to ensure consistency)
    const ids = [session.user.id, receiverId].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;

    const newMessage = await Message.create({
      conversationId,
      senderId: session.user.id,
      receiverId,
      message,
      relatedEntityType,
      relatedEntityId
    });

    const populated = await Message.findById(newMessage._id)
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role');

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}