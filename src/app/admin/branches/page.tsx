import connectDB from '@/lib/db/mongodb';
import Branch from '@/lib/db/models/Branch';
import Link from 'next/link';
import BranchActionsClient from '@/components/admin/BranchActionsClient';

export default async function BranchesPage() {
  await connectDB();
  
  const branches = await Branch.find()
    .populate('managerId')
    .sort({ createdAt: -1 })
    .lean();

  // Convert to plain objects
  const plainBranches = branches.map(branch => ({
    _id: branch._id.toString(),
    name: branch.name,
    code: branch.code || '',
    location: branch.location,
    isActive: branch.isActive ?? true,
    managerId: branch.managerId ? {
      _id: branch.managerId._id.toString(),
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