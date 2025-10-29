import connectDB from './mongodb';
import User from './models/User';
import Branch from './models/Branch';
import Product from './models/Product';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Branch.deleteMany({});
  await Product.deleteMany({});

  // Create admin
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await User.create({
    email: 'admin@warehouse.com',
    password: adminPassword,
    name: 'System Administrator',
    role: 'admin',
    isActive: true
  });

  // Create warehouse manager
  const warehousePassword = await bcrypt.hash('Warehouse@123', 10);
  await User.create({
    email: 'warehouse@warehouse.com',
    password: warehousePassword,
    name: 'Warehouse Manager',
    role: 'warehouse_manager',
    isActive: true
  });

  // Create branches
  const branches = await Branch.insertMany([
    { name: 'East Legon Branch', code: 'BR001', location: 'Accra East Legon' },
    { name: 'Airport Branch', code: 'BR002', location: 'Accra Airport' },
    { name: 'Osu Branch', code: 'BR003', location: 'Accra Osu' },
    { name: 'Spintex Branch', code: 'BR004', location: 'Accra Spintex' },
    { name: 'Labone Branch', code: 'BR005', location: 'Accra Labone' },
    { name: 'East Legon Extension Branch', code: 'BR006', location: 'Accra East Extension' }
  ]);

  // Create branch managers
  const branchPassword = await bcrypt.hash('Branch@123', 10);
  for (let i = 0; i < branches.length; i++) {
    await User.create({
      email: `branch${i + 1}@warehouse.com`,
      password: branchPassword,
      name: `${branches[i].name} Manager`,
      role: 'branch_manager',
      branchId: branches[i]._id,
      phone: '+233200000000',
      isActive: true
    });
  }

  // Create products
  const products = [
    { name: 'Crm Baked Beans Pcs', category: 'CRM', unit: 'Pcs' },
    { name: 'Crm Hommos Can (Pcs)', category: 'CRM', unit: 'Pcs' },
    { name: 'Crm Milk (Ltr)', category: 'CRM', unit: 'Ltr' },
    { name: 'Crm Peri Peri Sauce (Pcs)', category: 'CRM', unit: 'Pcs' },
    { name: 'Crm Mushroom Sliced (Ctns)', category: 'CRM', unit: 'Ctns' },
    { name: 'Crm Sweet Corn (Pcs)', category: 'CRM', unit: 'Pcs' },
    { name: 'Crm Black Pepper Whole (Pcs)', category: 'CRM', unit: 'Pcs' },
    { name: 'Crm Sunflower Oil (Ltrs)', category: 'CRM', unit: 'Ltrs' },
    { name: 'Crm Cheddar Cheese Block (Kg)', category: 'CRM', unit: 'Kg' },
    { name: 'Crm Mozarella Cheese (Kg)', category: 'CRM', unit: 'Kg' },
    { name: 'Stella', category: 'Beverage', unit: 'Btl' },
    { name: 'Red Bull', category: 'Beverage', unit: 'Can' },
    { name: 'Water Large', category: 'Beverage', unit: 'Btl' }
  ];

  await Product.insertMany(products);

  console.log('✅ Database seeded successfully!');
}