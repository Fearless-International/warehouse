import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Branch from '@/lib/db/models/Branch';
import User from '@/lib/db/models/User';

// Delete Branch
export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const branchId = params.id;

    // Check if any users are assigned to this branch
    const usersInBranch = await User.countDocuments({ branchId });

    if (usersInBranch > 0) {
      return NextResponse.json(
        { error: `Cannot delete branch. ${usersInBranch} user(s) are assigned to this branch.` },
        { status: 400 }
      );
    }

    const branch = await Branch.findByIdAndDelete(branchId);

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete branch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update Branch
export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const branchId = params.id;
    const body = await req.json();
    const { name, location, manager } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (manager !== undefined) updateData.manager = manager;

    const branch = await Branch.findByIdAndUpdate(
      branchId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Branch updated successfully',
      branch
    });

  } catch (error: any) {
    console.error('Update branch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}