import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Product from '@/lib/db/models/Product';
import Notification from '@/lib/db/models/Notification';

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'warehouse_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { action, items, generalRemarks } = await req.json();
    const requestId = params.id;

    const request = await Request.findById(requestId)
      .populate('requestedBy')
      .populate('branchId');

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been reviewed' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['approved', 'rejected', 'partially_approved'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update request status
    request.status = action;
    request.reviewedBy = session.user.id;
    request.reviewedAt = new Date();
    request.generalRemarks = generalRemarks;

    // Process each item
    const updatedItems = request.items.map((item: any) => {
      const reviewedItem = items.find((i: any) => i.productId === item.productId.toString());
      
      if (reviewedItem) {
        return {
          ...item.toObject(),
          availability: reviewedItem.availability, // 'available', 'not_available', 'partially_available'
          approvedQuantity: reviewedItem.approvedQuantity || 0,
          itemRemarks: reviewedItem.itemRemarks || ''
        };
      }
      return item;
    });

    request.items = updatedItems;

    // If approved or partially approved, update product quantities
    if (action === 'approved' || action === 'partially_approved') {
      for (const item of updatedItems) {
        if (item.availability === 'available' || item.availability === 'partially_available') {
          const quantityToDeduct = item.approvedQuantity || item.requestedQuantity;
          
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: -quantityToDeduct } }
          );
        }
      }
    }

    await request.save();

    // Create notification for branch manager
    await Notification.create({
      userId: request.requestedBy._id,
      title: `Request ${action === 'approved' ? 'Approved' : action === 'partially_approved' ? 'Partially Approved' : 'Rejected'}`,
      message: `Your request ${request.requestNumber} has been ${action}. ${generalRemarks || ''}`,
      type: 'request_review',
      link: `/branch/requests/${request._id}`,
      read: false
    });

    return NextResponse.json({
      success: true,
      message: `Request ${action} successfully`,
      request
    });

  } catch (error: any) {
    console.error('Review request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}