import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Product from '@/lib/db/models/Product';
import Link from 'next/link';
import UpgradePrompt from '@/components/UpgradePrompt';
import { checkServerLicense } from '@/lib/utils/checkLicense';

// ============================================================
// 🔐 LICENSE VALIDATION HELPER
// ============================================================
async function getLicense() {
  const licenseKey = process.env.LICENSE_KEY;

  if (!licenseKey) {
    return {
      type: 'basic',
      features: {
        anomalyDetection: false,
        advancedAnalytics: false,
        customReports: false,
        querySystem: false,
        mobilePWA: false,
        apiAccess: false,
        whiteLabel: false,
        smsNotifications: false,
        multiWarehouse: false,
      }
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

// ============================================================
// 📊 MAIN COMPONENT
// ============================================================
export default async function WarehouseAnomaliesPage() {
  // 1️⃣ CHECK LICENSE FIRST
  const license = await checkServerLicense();

  if (!license.active || !license.features?.anomalyDetection) {
    return <UpgradePrompt 
      feature="Anomaly Detection" 
      description="Automatically detect unusual ordering patterns and prevent fraud with our advanced anomaly detection system."
      requiredPlan="Professional"
      currentPlan={license.type}
    />;
  }

  // 2️⃣ CONNECT TO DATABASE
  await connectDB();

  // Get all requests from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRequests = await Request.find({
    createdAt: { $gte: thirtyDaysAgo },
    status: { $ne: 'rejected' }
  })
    .populate('branchId')
    .populate('requestedBy')
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

    // Calculate statistics
    const productStats: any = {};

    historicalRequests.forEach((req: any) => {
      req.items.forEach((item: any) => {
        const productId = item.productId.toString();
        if (!productStats[productId]) {
          productStats[productId] = { quantities: [], total: 0, count: 0 };
        }
        productStats[productId].quantities.push(item.requestedQuantity);
        productStats[productId].total += item.requestedQuantity;
        productStats[productId].count += 1;
      });
    });

    // Calculate averages
    Object.keys(productStats).forEach(productId => {
      const stat = productStats[productId];
      stat.average = stat.total / stat.count;
    });

    const anomalies: any[] = [];
    const threshold = 0.10; // 10% threshold

    request.items.forEach((item: any) => {
      const productId = item.productId._id.toString();
      const currentQuantity = item.requestedQuantity;

      if (productStats[productId]) {
        const avgQuantity = productStats[productId].average;
        const deviation = Math.abs(currentQuantity - avgQuantity) / avgQuantity;

        if (deviation > threshold) {
          const deviationPercent = Math.round(deviation * 100);
          anomalies.push({
            product: item.productId.name,
            currentQuantity,
            averageQuantity: Math.round(avgQuantity),
            deviation: deviationPercent,
            type: currentQuantity > avgQuantity ? 'high' : 'low',
            severity: deviationPercent > 50 ? 'critical' : deviationPercent > 25 ? 'high' : 'moderate'
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

  // Calculate summary statistics
  const stats = {
    totalRequests: recentRequests.length,
    requestsWithAnomalies: requestsWithAnomalies.length,
    totalAnomalies: requestsWithAnomalies.reduce((sum, r) => sum + r.anomalies.length, 0),
    criticalAnomalies: requestsWithAnomalies.reduce((sum, r) =>
      sum + r.anomalies.filter((a: any) => a.severity === 'critical').length, 0
    )
  };

  // ============================================================
  // 🧭 PAGE RENDER
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Anomaly Detection & Investigation</h1>

      {/* Professional Badge */}
      <div className="mb-6">
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
          ✨ Professional Feature Active
        </span>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 mb-6 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">📊 How Anomaly Detection Works</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Smart Pattern Recognition:</strong> The system analyzes the last 90 days of ordering history
            for each branch to establish normal ordering patterns.
          </p>
          <p>
            <strong>10% Sensitivity Threshold:</strong> Orders that deviate 10% or more from the historical average
            are flagged for investigation. This catches unusual patterns early.
          </p>
          <p>
            <strong>Example:</strong> If a branch typically orders 50 units of a product, orders above 55 or below 45
            will trigger an anomaly alert.
          </p>
          <div className="flex gap-4 mt-3 pt-3 border-t border-blue-300">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded">MODERATE</span>
              <span className="text-xs">10-25% deviation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded">HIGH</span>
              <span className="text-xs">25-50% deviation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded">CRITICAL</span>
              <span className="text-xs">&gt;50% deviation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-blue-700 text-sm font-medium">Total Requests</p>
          <p className="text-3xl font-bold text-blue-900">{stats.totalRequests}</p>
          <p className="text-xs text-blue-600 mt-1">Last 30 days</p>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <p className="text-orange-700 text-sm font-medium">Flagged Requests</p>
          <p className="text-3xl font-bold text-orange-900">{stats.requestsWithAnomalies}</p>
          <p className="text-xs text-orange-600 mt-1">
            {stats.totalRequests > 0 ? Math.round((stats.requestsWithAnomalies / stats.totalRequests) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">Total Anomalies</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.totalAnomalies}</p>
          <p className="text-xs text-yellow-600 mt-1">Across all requests</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Critical</p>
          <p className="text-3xl font-bold text-red-900">{stats.criticalAnomalies}</p>
          <p className="text-xs text-red-600 mt-1">Urgent investigation</p>
        </div>
      </div>

      {/* Anomalies List */}
      {requestsWithAnomalies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-700 text-lg font-semibold">No anomalies detected in the last 30 days</p>
          <p className="text-gray-500 text-sm mt-2">All branch orders are within normal patterns</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requestsWithAnomalies.map((request: any) => (
            <div key={request._id.toString()} className="bg-white rounded-lg shadow-lg border-2 border-orange-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{request.requestNumber}</h3>
                  <p className="text-gray-700 font-medium">{request.branchId.name}</p>
                  <p className="text-sm text-gray-500">
                    Requested by: {request.requestedBy?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'partially_approved' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                    {request.anomalies.length} Anomal{request.anomalies.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {request.anomalies.map((anomaly: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    anomaly.severity === 'critical' ? 'bg-red-50 border-red-500' :
                    anomaly.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                    anomaly.type === 'high' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{anomaly.product}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            anomaly.severity === 'critical' ? 'bg-red-200 text-red-800' :
                            anomaly.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {anomaly.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Current Order: <strong className="text-orange-600">{anomaly.currentQuantity}</strong> units |
                          Historical Average: <strong className="text-blue-600">{anomaly.averageQuantity}</strong> units
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-3xl font-bold ${
                          anomaly.type === 'high' ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                          {anomaly.type === 'high' ? '↑' : '↓'} {anomaly.deviation}%
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {anomaly.type === 'high' ? 'Above' : 'Below'} normal
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex gap-3">
                <Link
                  href={`/warehouse/requests/${request._id}`}
                  className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  View Request Details
                </Link>
                <button
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
                  onClick={() => alert('Query functionality coming soon!')}
                >
                  📨 Query Branch Manager
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
