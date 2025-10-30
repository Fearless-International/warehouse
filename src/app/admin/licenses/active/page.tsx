import connectDB from '@/lib/db/mongodb';
import SystemSettings from '@/lib/db/models/SystemSettings';
import License from '@/lib/db/models/License';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Calendar, Users, Building2, CheckCircle, XCircle, AlertTriangle, Crown } from 'lucide-react';

export default async function ActiveLicensePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  // Get active license
  const activeLicense = await SystemSettings.findOne({
    settingKey: 'active_license'
  });

  if (!activeLicense) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-2xl p-12 text-center">
          <AlertTriangle size={64} className="mx-auto mb-4 text-yellow-600" />
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            No Active License
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your system is currently running on the Basic plan (free tier).
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin/licenses/generate"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Generate License
            </Link>
            <Link
              href="/activate"
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
            >
              Activate License
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get full license details
  const license = await License.findOne({
    licenseKey: activeLicense.settingValue
  }).lean();

  if (!license) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-12 text-center">
          <XCircle size={64} className="mx-auto mb-4 text-red-600" />
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            License Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Active license not found in database. Please reactivate.
          </p>
          <Link
            href="/activate"
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
          >
            Reactivate License
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = license.expiryDate && new Date() > new Date(license.expiryDate);
  const isSuspended = license.status === 'suspended';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active License</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your system license</p>
        </div>
        <Link
          href="/admin/licenses"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
        >
          Back to Licenses
        </Link>
      </div>

      {/* Status Alert */}
      {isExpired ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={24} />
            <div>
              <p className="font-bold text-red-900 dark:text-red-100">License Expired</p>
              <p className="text-sm text-red-700 dark:text-red-300">This license expired on {new Date(license.expiryDate!).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ) : isSuspended ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" size={24} />
            <div>
              <p className="font-bold text-yellow-900 dark:text-yellow-100">License Suspended</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">This license has been suspended</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="font-bold text-green-900 dark:text-green-100">License Active</p>
              <p className="text-sm text-green-700 dark:text-green-300">Your license is valid and active</p>
            </div>
          </div>
        </div>
      )}

      {/* License Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Header with Plan Badge */}
        <div className={`p-6 bg-gradient-to-r ${
          license.licenseType === 'enterprise' ? 'from-orange-500 to-red-500' :
          license.licenseType === 'professional' ? 'from-blue-500 to-purple-500' :
          'from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Crown size={32} />
              <div>
                <h2 className="text-2xl font-bold uppercase">{license.licenseType} Plan</h2>
                <p className="text-white/80 text-sm">Active System License</p>
              </div>
            </div>
            <Shield size={40} className="opacity-50" />
          </div>
        </div>

        {/* License Info */}
        <div className="p-6 space-y-6">
          
          {/* License Key */}
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">License Key</label>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-lg">
              {license.licenseKey}
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Client Name</label>
              <p className="text-gray-900 dark:text-white font-medium">{license.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Client Email</label>
              <p className="text-gray-900 dark:text-white font-medium">{license.clientEmail}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Issued Date</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(license.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-red-600" size={20} />
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Expiry Date</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="text-purple-600" size={20} />
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Max Branches</label>
                <p className="text-gray-900 dark:text-white font-medium text-xl">{license.maxBranches}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-green-600" size={20} />
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block">Max Users</label>
                <p className="text-gray-900 dark:text-white font-medium text-xl">{license.maxUsers}</p>
              </div>
            </div>
          </div>

          {/* Installation Info */}
          {license.installationDomain && (
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Installation Domain</label>
              <p className="text-gray-900 dark:text-white font-medium">{license.installationDomain}</p>
            </div>
          )}

          {/* Features */}
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Enabled Features</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(license.features).map(([feature, enabled]) => (
                <div key={feature} className={`flex items-center gap-2 p-3 rounded-lg ${
                  enabled ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-900'
                }`}>
                  {enabled ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    enabled ? 'text-green-900 dark:text-green-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {license.notes && (
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Notes</label>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                {license.notes}
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Link
              href={`/admin/licenses/${license._id.toString()}/upgrade`}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-center"
            >
              Upgrade License
            </Link>
            <Link
              href="/activate"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Change License
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}