import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Link from 'next/link';

export default async function AnomaliesPage() {
  await connectDB();

  // Get all requests from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRequests = await Request.find({
    createdAt: { $gte: thirtyDaysAgo }
  })
    .populate('branchId')
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .lean();

  // Detect anomalies for each request
  const requestsWithAnomalies: any[] = [];

  for (const request of recentRequests) {
    const ninetyDaysAgo = new Date(request.createdAt);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const historicalRequests = await Request.find({
      branchId: request.branchId._id,
      _id: { $ne: request._id },
      createdAt: { 
        $gte: ninetyDaysAgo,
        $lt: request.createdAt
      }
    }).lean();

    if (historicalRequests.length < 3) continue;

    const productAverages: any = {};
    
    historicalRequests.forEach((req: any) => {
      req.items.forEach((item: any) => {
        const productId = item.productId.toString();
        if (!productAverages[productId]) {
          productAverages[productId] = { total: 0, count: 0 };
        }
        productAverages[productId].total += item.requestedQuantity;
        productAverages[productId].count += 1;
      });
    });

    const anomalies: any[] = [];
    const threshold = 0.5;

    request.items.forEach((item: any) => {
      const productId = item.productId._id.toString();
      const currentQuantity = item.requestedQuantity;

      if (productAverages[productId]) {
        const avgQuantity = productAverages[productId].total / productAverages[productId].count;
        const deviation = Math.abs(currentQuantity - avgQuantity) / avgQuantity;

        if (deviation > threshold) {
          anomalies.push({
            product: item.productId.name,
            currentQuantity,
            averageQuantity: Math.round(avgQuantity),
            deviation: Math.round(deviation * 100),
            type: currentQuantity > avgQuantity ? 'high' : 'low'
          });
        }
      }
    });

    if (anomalies.length > 0) {
      requestsWithAnomalies.push({
        ...request,
        anomalies
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Anomaly Detection & Investigation</h1>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>About Anomaly Detection:</strong> The system automatically detects when branch orders are significantly higher or lower than their historical average (50% threshold). This helps identify unusual ordering patterns that may require investigation.
        </p>
      </div>

      {requestsWithAnomalies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No anomalies detected in the last 30 days</p>
          <p className="text-gray-400 text-sm mt-2">All branch orders are within normal ranges</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requestsWithAnomalies.map((request: any) => (
            <div key={request._id.toString()} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{request.requestNumber}</h3>
                  <p className="text-gray-600">{request.branchId.name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {request.anomalies.length} Anomal{request.anomalies.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {request.anomalies.map((anomaly: any, idx: number) => (
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
                        <p className="text-xs text-gray-500">
                          {anomaly.type === 'high' ? 'Above' : 'Below'} average
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/hr/requests/${request._id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Full Request Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}