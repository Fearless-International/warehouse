import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Product from '@/lib/db/models/Product';
import { createNotification } from '@/lib/services/notificationService';

export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'warehouse_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, deliveryDate, generalRemarks, items } = await req.json();

    await connectDB();

    const request = await Request.findById(params.id)
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

    // Update request items with availability decisions
    const updatedItems = request.items.map((item: any) => {
      const reviewedItem = items.find((i: any) => i.productId === item.productId.toString());
      
      if (reviewedItem) {
        return {
          ...item.toObject(),
          availability: reviewedItem.availability,
          approvedQuantity: reviewedItem.approvedQuantity || 0,
          itemRemarks: reviewedItem.itemRemarks || '',
          restockDate: reviewedItem.restockDate ? new Date(reviewedItem.restockDate) : null,
          canFulfillAfterRestock: reviewedItem.canFulfillAfterRestock || false
        };
      }
      return item;
    });

    request.items = updatedItems;
    request.status = status;
    request.reviewedBy = session.user.id;
    request.reviewedAt = new Date();
    request.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
    request.generalRemarks = generalRemarks;

    // Deduct inventory for approved items
    if (status === 'approved' || status === 'partially_approved') {
      for (const item of updatedItems) {
        if (item.availability === 'available' || item.availability === 'partially_available') {
          const quantityToDeduct = item.availability === 'available' 
            ? item.requestedQuantity 
            : item.approvedQuantity;

          // Update product quantity
          const product = await Product.findById(item.productId);
          if (product) {
            if (product.quantity < quantityToDeduct) {
              return NextResponse.json(
                { error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Trying to deduct: ${quantityToDeduct}` },
                { status: 400 }
              );
            }
            
            product.quantity -= quantityToDeduct;
            await product.save();
          }
        }
      }
    }

    await request.save();

    // Prepare notification message
    let notificationMessage = '';
    let notificationTitle = '';

    if (status === 'approved') {
      notificationTitle = 'Request Approved ✅';
      notificationMessage = `Your request ${request.requestNumber} has been fully approved. All items will be delivered on ${new Date(deliveryDate).toLocaleDateString()}.`;
    } else if (status === 'rejected') {
      notificationTitle = 'Request Rejected ❌';
      notificationMessage = `Your request ${request.requestNumber} has been rejected. Please contact warehouse for details.`;
    } else if (status === 'partially_approved') {
      notificationTitle = 'Request Partially Approved ⚠️';
      const approvedItems = updatedItems.filter((i: any) => i.availability !== 'not_available').length;
      const totalItems = updatedItems.length;
      notificationMessage = `Your request ${request.requestNumber} has been partially approved. ${approvedItems} of ${totalItems} items approved. Check details for quantities.`;

      // After determining status, build detailed message
      let itemsSummary = '';
      if (status === 'partially_approved') {
        const fullyApproved = updatedItems.filter((i: any) => i.availability === 'available');
        const partiallyApproved = updatedItems.filter((i: any) => i.availability === 'partially_available');
        const notAvailable = updatedItems.filter((i: any) => i.availability === 'not_available');
        const restockItems = updatedItems.filter((i: any) => i.canFulfillAfterRestock);
        
        itemsSummary = `\n\nDetails:\n`;
        if (fullyApproved.length > 0) {
          itemsSummary += `✅ ${fullyApproved.length} item(s) fully approved\n`;
        }
        if (partiallyApproved.length > 0) {
          itemsSummary += `⚠️ ${partiallyApproved.length} item(s) partially approved\n`;
        }
        if (notAvailable.length > 0) {
          itemsSummary += `❌ ${notAvailable.length} item(s) not available\n`;
        }
        if (restockItems.length > 0) {
          itemsSummary += `📦 ${restockItems.length} item(s) available after restocking\n`;
        }

        notificationMessage += itemsSummary;
      }
    }

    if (generalRemarks) {
      notificationMessage += ` Remarks: ${generalRemarks}`;
    }

    // Send notification to branch manager
    await createNotification({
      recipientId: request.requestedBy._id.toString(),
      type: status === 'approved' ? 'request_approved' : status === 'rejected' ? 'request_rejected' : 'request_partial',
      title: notificationTitle,
      message: notificationMessage,
      relatedEntityType: 'request',
      relatedEntityId: request._id.toString()
    });

    return NextResponse.json({
      success: true,
      message: `Request ${status.replace('_', ' ')} successfully`,
      request: {
        _id: request._id.toString(),
        requestNumber: request.requestNumber,
        status: request.status,
        items: updatedItems.map((item: any) => ({
          productId: item.productId.toString(),
          availability: item.availability,
          approvedQuantity: item.approvedQuantity,
          requestedQuantity: item.requestedQuantity
        }))
      }
    });

  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
