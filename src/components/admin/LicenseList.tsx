'use client';

import { useState } from 'react';
import { Eye, Ban, CheckCircle, XCircle, Calendar, User, Building, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface License {
  _id: string;
  licenseKey: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  licenseType: string;
  status: string;
  amount?: number;
  issuedDate: string;
  expiryDate?: string;
  installationDomain?: string;
  features: Record<string, boolean>;
}

export default function LicenseList({ licenses }: { licenses: License[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'suspended'>('all');
  const [search, setSearch] = useState('');

  const filteredLicenses = licenses.filter(license => {
    const matchesFilter = filter === 'all' || license.status === filter;
    const matchesSearch = 
      license.clientName.toLowerCase().includes(search.toLowerCase()) ||
      license.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      license.licenseKey.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-500';
      case 'expired': return 'bg-red-100 text-red-800 border-red-500';
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
const handleSuspend = async (licenseId: string) => {
  if (!confirm('Are you sure you want to suspend this license?')) return;

  try {
    const res = await fetch(`/api/admin/license/${licenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'suspend' })
    });

    if (res.ok) {
      alert('License suspended successfully!');
      window.location.reload();
    } else {
      alert('Failed to suspend license');
    }
  } catch (error) {
    alert('An error occurred');
  }
};

const handleReactivate = async (licenseId: string) => {
  if (!confirm('Are you sure you want to reactivate this license?')) return;

  try {
    const res = await fetch(`/api/admin/license/${licenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reactivate' })
    });

    if (res.ok) {
      alert('License reactivated successfully!');
      window.location.reload();
    } else {
      alert('Failed to reactivate license');
    }
  } catch (error) {
    alert('An error occurred');
  }
};
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or license key..."
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'active', 'expired', 'suspended'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* License Cards */}
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {filteredLicenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No licenses found</p>
          </div>
        ) : (
          filteredLicenses.map((license) => (
            <div
              key={license._id}
              className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Left Side - Client Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={18} className="text-gray-600 dark:text-gray-400" />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {license.clientName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {license.clientEmail}
                      </p>
                      {license.clientCompany && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building size={14} className="text-gray-500" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {license.clientCompany}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(license.status)}`}>
                      {license.status.toUpperCase()}
                    </span>
                  </div>

                  {/* License Key */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">License Key</p>
                    <code className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                      {license.licenseKey}
                    </code>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Type</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(license.licenseType)}`}>
                        {license.licenseType.toUpperCase()}
                      </span>
                    </div>
                    
                    {license.amount && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Amount</p>
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-green-600" />
                          <span className="font-bold text-green-600">${license.amount}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Issued</p>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">
                          {new Date(license.issuedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {license.expiryDate && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Expires</p>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-red-500" />
                          <span className="text-gray-700 dark:text-gray-300 text-xs">
                            {new Date(license.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {license.installationDomain && (
                    <div className="mt-3 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Domain: </span>
                      <code className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                        {license.installationDomain}
                      </code>
                    </div>
                  )}
                </div>

                {/* Right Side - Actions */}
                <div className="flex md:flex-col gap-2">
                  <Link
                    href={`/admin/licenses/${license._id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    <Eye size={16} />
                    View
                  </Link>
                  
                  {license.status === 'active' && (
  <button
    onClick={() => handleSuspend(license._id)}
    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm"
  >
    <Ban size={16} />
    Suspend
  </button>
)}

{license.status === 'suspended' && (
  <button
    onClick={() => handleReactivate(license._id)}
    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
  >
    <CheckCircle size={16} />
    Activate
  </button>
)}
                </div>
              </div>

              {/* Feature Badges */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Enabled Features:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(license.features).map(([key, value]) => 
                    value && (
                      <span
                        key={key}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                      >
                        ✓ {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}