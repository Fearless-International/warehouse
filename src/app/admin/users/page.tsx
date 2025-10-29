import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Branch from '@/lib/db/models/Branch';
import Link from 'next/link';
import UserActionsClient from '@/components/admin/UserActionsClient';

export default async function UsersPage() {
  await connectDB();
  
  const users = await User.find()
    .populate('branchId')
    .sort({ createdAt: -1 })
    .lean();

  const branches = await Branch.find()
    .sort({ name: 1 })
    .lean();

  // Convert to plain objects
  const plainUsers = users.map(user => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive ?? true,
    branchId: user.branchId ? {
      _id: user.branchId._id.toString(),
      name: user.branchId.name
    } : undefined
  }));

  const plainBranches = branches.map(branch => ({
    _id: branch._id.toString(),
    name: branch.name
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link 
          href="/admin/users/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add User
        </Link>
      </div>

      <UserActionsClient initialUsers={plainUsers} branches={plainBranches} />
    </div>
  );
}