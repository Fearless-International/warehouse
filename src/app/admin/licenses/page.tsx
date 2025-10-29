import connectDB from '@/lib/db/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import License from '@/lib/db/models/License';
import Link from 'next/link';
import LicenseList from '@/components/admin/LicenseList';

export default async function AdminLicensesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  await connectDB();

  const licenses = await License.find()
    .sort({ createdAt: -1 })
    .lean();

  // Calculate statistics
  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    suspended: licenses.filter(l => l.status === 'suspended').length,
    trial: licenses.filter(l => l.status === 'trial').length,
    basic: licenses.filter(l => l.licenseType === 'basic').length,
    professional: licenses.filter(l => l.licenseType === 'professional').length,
    enterprise: licenses.filter(l => l.licenseType === 'enterprise').length,
    totalRevenue: licenses.reduce((sum, l) => sum + (l.amount || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500 bg-clip-text text-transparent mb-2">
            License Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all system licenses
          </p>
        </div>
        <Link
          href="/admin/licenses/generate"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <span className="text-xl">➕</span>
          Generate New License
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Licenses */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-500 dark:border-blue-400 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Total Licenses</span>
            <span className="text-3xl">🔑</span>
          </div>
          <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Active: {stats.active} | Expired: {stats.expired}
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 dark:border-green-400 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 dark:text-green-300 text-sm font-semibold">Total Revenue</span>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-green-900 dark:text-green-100">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Lifetime earnings
          </p>
        </div>

        {/* By Type */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-500 dark:border-purple-400 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 dark:text-purple-300 text-sm font-semibold">License Types</span>
            <span className="text-3xl">📊</span>
          </div>
          <div className="space-y-1 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300">Basic:</span>
              <span className="font-bold text-purple-900 dark:text-purple-100">{stats.basic}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300">Pro:</span>
              <span className="font-bold text-purple-900 dark:text-purple-100">{stats.professional}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 dark:text-purple-300">Enterprise:</span>
              <span className="font-bold text-purple-900 dark:text-purple-100">{stats.enterprise}</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-500 dark:border-orange-400 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-700 dark:text-orange-300 text-sm font-semibold">Status</span>
            <span className="text-3xl">📈</span>
          </div>
          <div className="space-y-1 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-orange-700 dark:text-orange-300">Active:</span>
              <span className="font-bold text-green-600">{stats.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-700 dark:text-orange-300">Trial:</span>
              <span className="font-bold text-blue-600">{stats.trial}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-700 dark:text-orange-300">Expired:</span>
              <span className="font-bold text-red-600">{stats.expired}</span>
            </div>
          </div>
        </div>
      </div>

      {/* License List */}
      <LicenseList licenses={JSON.parse(JSON.stringify(licenses))} />
    </div>
  );
}