import connectDB from '@/lib/db/mongodb';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function WarehouseQueryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectDB();
  
  const query = await AnomalyQuery.findById(id)
    .populate('requestId')
    .populate('branchId')
    .populate('queriedBy')
    .lean();

  if (!query) notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/warehouse/queries" className="text-blue-600 hover:text-blue-800">
          ← Back to Queries
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Query Details</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600">Branch</p>
            <p className="font-bold text-lg">{query.branchId?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              query.status === 'responded' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {query.status.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Request Number</p>
            <p className="font-medium">{query.requestId?.requestNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date Sent</p>
            <p className="font-medium">{new Date(query.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3">Anomalies Detected</h3>
          <div className="space-y-3">
            {query.anomalyDetails.map((anomaly: any, idx: number) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                anomaly.type === 'high' 
                  ? 'bg-orange-50 border-orange-500' 
                  : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{anomaly.product}</p>
                    <p className="text-sm text-gray-600">
                      Ordered: <strong>{anomaly.currentQuantity}</strong> | 
                      Historical Avg: <strong>{anomaly.averageQuantity}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      anomaly.type === 'high' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {anomaly.type === 'high' ? '↑' : '↓'} {anomaly.deviation}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Your Query</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">{query.queryMessage}</p>
          </div>
        </div>

        {query.branchResponse ? (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Branch Manager Response</p>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-800 text-lg">{query.branchResponse}</p>
              <p className="text-xs text-gray-500 mt-3">
                Responded on {new Date(query.respondedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-700 font-medium">
              ⏱️ Waiting for branch manager response...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}