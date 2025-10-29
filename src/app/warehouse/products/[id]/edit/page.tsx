import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import { notFound } from 'next/navigation';
import EditProductForm from '@/components/EditProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectDB();
  
  const product = await Product.findById(id).lean();
  if (!product) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <EditProductForm product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}