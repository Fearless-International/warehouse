import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';

// GET - View license details
export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const license = await License.findById(params.id);

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    return NextResponse.json({ license });

  } catch (error: any) {
    console.error('Get license error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update license (suspend/reactivate)
export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, status, notes } = await req.json();

    await connectDB();

    const license = await License.findById(params.id);

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    if (action === 'suspend') {
      license.status = 'suspended';
      if (notes) license.notes = (license.notes || '') + `\n[${new Date().toISOString()}] Suspended: ${notes}`;
    } else if (action === 'reactivate') {
      license.status = 'active';
      if (notes) license.notes = (license.notes || '') + `\n[${new Date().toISOString()}] Reactivated: ${notes}`;
    } else if (status) {
      license.status = status;
    }

    await license.save();

    console.log(`License ${params.id} updated: ${action || status}`);

    return NextResponse.json({
      success: true,
      message: 'License updated successfully',
      license
    });

  } catch (error: any) {
    console.error('Update license error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete license
export async function DELETE(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const license = await License.findByIdAndDelete(params.id);

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    console.log(`License ${params.id} deleted`);

    return NextResponse.json({
      success: true,
      message: 'License deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete license error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}