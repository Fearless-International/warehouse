import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find({}, { email: 1, role: 1, name: 1, isActive: 1 }).lean();
    
    return NextResponse.json({ 
      count: users.length,
      users: users
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}