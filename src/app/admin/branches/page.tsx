import connectDB from '@/lib/db/mongodb';
import Branch from '@/lib/db/models/Branch';
import Link from 'next/link';
import BranchActionsClient from '@/components/admin/BranchActionsClient';

export default async function BranchesPage() {
   console.log('🔍 Fetching branches...');
  await connectDB();
  console.log('✅ Database connected');
  
  const branches = await Branch.find()
    .populate('managerId')
    .sort({ createdAt: -1 })
    .lean();
    console.log('📦 Branches found:', branches.length);

  // Convert to plain objects
  const plainBranches = branches.map(branch => ({
    _id: String(branch._id),
    name: branch.name,
    code: branch.code || '',
    location: branch.location,
    isActive: branch.isActive ?? true,
    managerId: branch.managerId ? {
      _id: String(branch.managerId._id),
      name: branch.managerId.name
    } : undefined,
    createdAt: branch.createdAt ? new Date(branch.createdAt).toISOString() : new Date().toISOString()
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Branch Management</h1>
        <Link 
          href="/admin/branches/new"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          + Add Branch
        </Link>
      </div>

      <BranchActionsClient initialBranches={plainBranches} />
    </div>
  );
}