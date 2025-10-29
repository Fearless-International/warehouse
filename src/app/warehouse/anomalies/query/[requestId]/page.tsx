import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import { notFound } from 'next/navigation';
import AnomalyQueryForm from '@/components/AnomalyQueryForm';

export default async function QueryAnomalyPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  
  await connectDB();
  
  const request = await Request.findById(requestId)
    .populate('branchId')
    .populate('items.productId')
    .lean();

  if (!request) notFound();

  // Calculate anomalies
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Query Branch About Anomaly</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <p className="text-sm text-gray-600">Branch</p>
          <p className="font-bold text-lg">{request.branchId.name}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Request Number</p>
          <p className="font-medium">{request.requestNumber}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-4">Detected Anomalies</h3>
          <div className="space-y-3">
            {anomalies.map((anomaly: any, idx: number) => (
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
      </div>

      <AnomalyQueryForm 
        requestId={requestId} 
        branchId={request.branchId._id.toString()}
        anomalies={anomalies}
      />
    </div>
  );
}