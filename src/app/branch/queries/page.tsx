import connectDB from '@/lib/db/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import Link from 'next/link';
import UpgradePrompt from '@/components/UpgradePrompt';
import { checkServerLicense } from '@/lib/utils/checkLicense';

export default async function BranchQueriesPage() {
  const session = await getServerSession(authOptions);
   const license = await checkServerLicense();
   if (!license.active || !license.features?.querySystem) {
    return <UpgradePrompt 
      feature="Query Management System" 
      description="Respond to warehouse queries about your orders. Provide explanations for unusual quantities and maintain clear communication."
      requiredPlan="Professional"
      currentPlan={license.type}
    />;
  }
  
  await connectDB();
  
  const queries = await AnomalyQuery.find({ branchId: session?.user.branchId })
    .populate('requestId')
    .populate('queriedBy')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Anomaly Queries</h1>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>About Queries:</strong> The warehouse may send queries when your order quantities are significantly different from your usual patterns. Please provide explanations to help them understand your needs better.
        </p>
      </div>

      {queries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No queries received</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((query: any) => (
            <div key={query._id.toString()} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Query about {query.requestId?.requestNumber}</h3>
                  <p className="text-sm text-gray-400">
                    Queried by {query.queriedBy?.name} on {new Date(query.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  query.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {query.status.toUpperCase()}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Anomalies Detected:</p>
                <div className="space-y-2">
                  {query.anomalyDetails.map((anomaly: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-lg text-sm ${
                      anomaly.type === 'high' ? 'bg-orange-50' : 'bg-blue-50'
                    }`}>
                      <strong>{anomaly.product}:</strong> Ordered {anomaly.currentQuantity} 
                      (avg: {anomaly.averageQuantity}) - {anomaly.deviation}% {anomaly.type}er
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Warehouse Question:</p>
                <p className="text-gray-800">{query.queryMessage}</p>
              </div>

              {query.branchResponse && (
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Response:</p>
                  <p className="text-gray-800">{query.branchResponse}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Responded on {new Date(query.respondedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/branch/queries/${query._id}`}
                  className={`inline-block px-6 py-2 rounded-lg font-medium ${
                    query.status === 'pending'
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {query.status === 'pending' ? 'Respond to Query' : 'View Details'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}