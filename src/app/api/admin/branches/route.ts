import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Branch from '@/lib/db/models/Branch';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, code, location } = await req.json();

    await connectDB();

    const existingBranch = await Branch.findOne({ $or: [{ name }, { code }] });
    if (existingBranch) {
      return NextResponse.json({ error: 'Branch name or code already exists' }, { status: 400 });
    }

    const branch = await Branch.create({
      name,
      code,
      location,
      isActive: true
    });

    return NextResponse.json({ success: true, branchId: branch._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}