import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Route based on role
  switch (session.user.role) {
    case 'admin':
    case 'hr':
      redirect('/admin');
      break;
    case 'warehouse_manager':
      redirect('/warehouse');
      break;
    case 'branch_manager':
      redirect('/branch');
      break;
    default:
      redirect('/login');
  }
}