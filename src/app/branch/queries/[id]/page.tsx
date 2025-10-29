import connectDB from '@/lib/db/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AnomalyQuery from '@/lib/db/models/AnomalyQuery';
import { notFound } from 'next/navigation';
import QueryResponseForm from '@/components/QueryResponseForm';

export default async function QueryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  await connectDB();
  
  const query = await AnomalyQuery.findById(id)
    .populate('requestId')
    .populate('branchId')
    .populate('queriedBy')
    .lean();

  if (!query) notFound();

  // Check if query belongs to this branch
  if (query.branchId._id.toString() !== session?.user.branchId) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Anomaly Query Details</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600">Request Number</p>
            <p className="font-bold text-lg">{query.requestId?.requestNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              query.status === 'responded' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {query.status.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Queried By</p>
            <p className="font-medium">{query.queriedBy?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
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
          <p className="text-sm text-gray-600 mb-2">Warehouse Question</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">{query.queryMessage}</p>
          </div>
        </div>

        {query.branchResponse ? (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Response</p>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-800">{query.branchResponse}</p>
              <p className="text-xs text-gray-500 mt-2">
                Responded on {new Date(query.respondedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <QueryResponseForm queryId={query._id.toString()} />
        )}
      </div>
    </div>
  );
}