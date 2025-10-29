import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import Link from 'next/link';
import UpgradePrompt from '@/components/UpgradePrompt';
import { checkServerLicense } from '@/lib/utils/checkLicense';

async function getLicense() {
  const licenseKey = process.env.LICENSE_KEY;
  
  if (!licenseKey) {
    return {
      type: 'basic',
      features: { querySystem: false }
    };
  }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        licenseKey,
        domain: process.env.NEXTAUTH_URL 
      }),
      cache: 'no-store'
    });

    const data = await res.json();
    return data.valid ? data.license : null;
  } catch (error) {
    console.error('License check failed:', error);
    return null;
  }
}

export default async function WarehouseQueriesPage() {
  // ✅ CHECK LICENSE FIRST
  const license = await checkServerLicense();
  
  if (!license.active || !license.features?.querySystem) {
    return <UpgradePrompt 
      feature="Query Management System" 
      description="Communicate directly with branch managers about unusual orders. Send queries, receive explanations, and maintain a complete communication history."
      requiredPlan="Professional"
      currentPlan={license.type}
    />;
  }

  // ✅ AUTH CHECK (optional)
  await getServerSession(authOptions);

  // ✅ DB + DATA LOAD
  await connectDB();

  const queries = await AnomalyQuery.find()
    .populate('requestId')
    .populate('branchId')
    .populate('queriedBy')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* ⭐ Professional Badge Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Anomaly Queries</h1>
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
          ✨ Professional Feature
        </span>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>Query Responses:</strong> View branch manager responses to your anomaly queries here.
        </p>
      </div>

      {/* If Empty */}
      {queries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No queries sent yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((query: any) => (
            <div key={query._id.toString()} className="bg-white rounded-lg shadow p-6">

              {/* Header Line */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{query.branchId?.name}</h3>
                  <p className="text-sm text-gray-600">
                    Request: {query.requestId?.requestNumber}
                  </p>
                  <p className="text-sm text-gray-400">
                    Sent on {new Date(query.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  query.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : query.status === 'responded' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {query.status.toUpperCase()}
                </span>
              </div>

              {/* Query Message */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Query:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{query.queryMessage}</p>
                </div>
              </div>

              {/* Branch Response OR Waiting */}
              {query.branchResponse ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Branch Response:</p>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-800">{query.branchResponse}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on {new Date(query.respondedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-700">
                    ⏱️ Waiting for branch response...
                  </p>
                </div>
              )}

              {/* Details Link */}
              <div className="mt-4">
                <Link
                  href={`/warehouse/queries/${query._id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Full Details →
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
