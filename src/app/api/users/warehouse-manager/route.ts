import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const warehouseManager = await User.findOne({ 
      role: 'warehouse_manager',
      isActive: true 
    }).select('_id name email').lean();

    if (!warehouseManager) {
      return NextResponse.json({ error: 'Warehouse manager not found' }, { status: 404 });
    }

    return NextResponse.json(warehouseManager);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}