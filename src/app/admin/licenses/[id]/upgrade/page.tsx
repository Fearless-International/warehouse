import connectDB from '@/lib/db/mongodb';
import License from '@/lib/db/models/License';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import UpgradeLicenseForm from '@/components/admin/UpgradeLicenseForm';

export default async function UpgradeLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  const license = await License.findById(id).lean();

  if (!license) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade License</h1>
      <UpgradeLicenseForm license={JSON.parse(JSON.stringify(license))} />
    </div>
  );
}