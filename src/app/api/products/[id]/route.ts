import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import Request from '@/lib/db/models/Request';

export async function PUT(req: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'warehouse_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { name, category, unit, quantity, price, supplier, isActive } = await req.json();

    await connectDB();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { 
        name, 
        category, 
        unit, 
        quantity: quantity || 0,
        price: price || 0,
        supplier: supplier || '',
        isActive 
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ ADD DELETE METHOD
export async function DELETE(req: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'warehouse_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;

    await connectDB();

    // Check if product is being used in any requests
    const usedInRequests = await Request.countDocuments({
      'items.productId': params.id
    });

    if (usedInRequests > 0) {
      return NextResponse.json(
        { error: `Cannot delete product. It is referenced in ${usedInRequests} request(s). Consider marking it as inactive instead.` },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}