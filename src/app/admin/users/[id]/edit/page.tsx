import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Branch from '@/lib/db/models/Branch';
import { notFound } from 'next/navigation';
import EditUserForm from '@/components/EditUserForm';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectDB();
  
  const user = await User.findById(id).populate('branchId').lean();
  if (!user) notFound();

  const branches = await Branch.find({ isActive: true }).lean();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>
      <EditUserForm 
        user={JSON.parse(JSON.stringify(user))} 
        branches={JSON.parse(JSON.stringify(branches))}
      />
    </div>
  );
}