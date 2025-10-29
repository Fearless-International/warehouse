import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'warehouse_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    await connectDB();

    const products = data.map((row: any) => ({
      name: row['Product Name'] || row.name || row.Name,
      category: row['Category'] || row.category,
      unit: row['Unit'] || row.unit,
      quantity: parseInt(row['Quantity'] || row.quantity || '0'),
      price: parseFloat(row['Price'] || row.price || '0'),
      supplier: row['Supplier'] || row.supplier || '',
      isActive: true
    }));

    // Validate products
    const errors: string[] = [];
    products.forEach((product, index) => {
      if (!product.name) {
        errors.push(`Row ${index + 2}: Product name is required`);
      }
      if (!product.category) {
        errors.push(`Row ${index + 2}: Category is required`);
      }
      if (!product.unit) {
        errors.push(`Row ${index + 2}: Unit is required`);
      }
      if (product.quantity < 0) {
        errors.push(`Row ${index + 2}: Quantity cannot be negative`);
      }
      if (product.price < 0) {
        errors.push(`Row ${index + 2}: Price cannot be negative`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found',
        details: errors 
      }, { status: 400 });
    }

    // Insert only new products, update existing ones
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        const existing = await Product.findOne({ name: product.name });
        
        if (existing) {
          // Update existing product
          existing.category = product.category;
          existing.unit = product.unit;
          existing.quantity += product.quantity; // Add to existing quantity
          existing.price = product.price || existing.price;
          existing.supplier = product.supplier || existing.supplier;
          await existing.save();
          updatedCount++;
        } else {
          // Create new product
          await Product.create(product);
          createdCount++;
        }
      } catch (err) {
        console.error('Error processing product:', product.name, err);
        skippedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      total: products.length
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}