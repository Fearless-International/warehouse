import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'warehouse_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, category, unit, quantity, price, supplier } = await req.json();

    if (!name || !category || !unit) {
      return NextResponse.json(
        { error: 'Name, category, and unit are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Product.findOne({ name });
    if (existing) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 });
    }

    const product = await Product.create({
      name,
      category,
      unit,
      quantity: quantity || 0,
      price: price || 0,
      supplier: supplier || '',
      isActive: true
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}