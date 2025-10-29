import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import RequestForm from '@/components/RequestForm';

export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const products = await Product.find({ isActive: true }).lean();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">New Product Request</h1>
      <RequestForm 
        products={JSON.parse(JSON.stringify(products))} 
        branchName={session?.user.branchName || ''} 
      />
    </div>
  );
}