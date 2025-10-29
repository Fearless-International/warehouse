import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Branch from '@/lib/db/models/Branch';
import Product from '@/lib/db/models/Product';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // Check if admin already exists - DON'T clear if data exists
    const adminExists = await User.findOne({ email: 'admin@warehouse.com' });
    
    if (adminExists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Database already seeded. Data preserved.' 
      });
    }

    // Only seed if no data exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Users already exist. Skipping seed.' 
      });
    }

    // Create admin
    await User.create({
      email: 'admin@warehouse.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'System Administrator',
      role: 'admin',
      isActive: true
    });

    // Create warehouse manager
    await User.create({
      email: 'warehouse@warehouse.com',
      password: await bcrypt.hash('Warehouse@123', 10),
      name: 'Warehouse Manager',
      role: 'warehouse_manager',
      isActive: true
    });

    // Create HR user
    await User.create({
      email: 'hr@warehouse.com',
      password: await bcrypt.hash('HR@123', 10),
      name: 'HR Manager',
      role: 'hr',
      isActive: true
    });

    // Create branch
    const branch = await Branch.create({
      name: 'Accra Central',
      code: 'BR001',
      location: 'Accra',
      isActive: true
    });

    // Create branch manager
    await User.create({
      email: 'branch1@warehouse.com',
      password: await bcrypt.hash('Branch@123', 10),
      name: 'Accra Branch Manager',
      role: 'branch_manager',
      branchId: branch._id,
      isActive: true
    });

    // Create products
    await Product.insertMany([
      { name: 'Crm Baked Beans Pcs', category: 'CRM', unit: 'Pcs', isActive: true },
      { name: 'Crm Milk (Ltr)', category: 'CRM', unit: 'Ltr', isActive: true },
      { name: 'Crm Sweet Corn (Pcs)', category: 'CRM', unit: 'Pcs', isActive: true },
      { name: 'Crm Cheddar Cheese Block (Kg)', category: 'CRM', unit: 'Kg', isActive: true }
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully!' 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}