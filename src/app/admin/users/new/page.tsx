import connectDB from '@/lib/db/mongodb';
import Branch from '@/lib/db/models/Branch';
import AddUserForm from '@/components/AddUserForm';

export default async function NewUserPage() {
  await connectDB();
  const branches = await Branch.find({ isActive: true }).lean();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New User</h1>
      <AddUserForm branches={JSON.parse(JSON.stringify(branches))} />
    </div>
  );
}