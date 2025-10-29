import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import { createNotification } from './notificationService';
import User from '@/lib/db/models/User';

/**
 * ANOMALY DETECTION SYSTEM
 * 
 * How it works:
 * 1. Analyzes last 90 days of historical orders for the branch
 * 2. Calculates average quantity and standard deviation for each product
 * 3. Detects orders that deviate significantly from normal patterns
 * 
 * Threshold: 10% deviation from historical average
 * - Orders 10% higher than average → High anomaly (possible overordering)
 * - Orders 10% lower than average → Low anomaly (possible underordering)
 * 
 * Example:
 * - Product: Crm Milk
 * - Historical average: 50 units
 * - Alert triggers if order is > 55 or < 45 units
 * 
 * Benefits:
 * - Detects fraud or errors early
 * - Identifies unusual demand patterns
 * - Helps optimize inventory management
 */

export async function detectAnomalies(requestId: string) {
  await connectDB();

  const request = await Request.findById(requestId)
    .populate('branchId')
    .populate('requestedBy')
    .populate('items.productId')
    .lean();

  if (!request) return;

  // Get historical data for this branch (last 90 days, excluding current request)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const historicalRequests = await Request.find({
    branchId: request.branchId._id,
    _id: { $ne: requestId },
    createdAt: { $gte: ninetyDaysAgo }
  }).lean();

  if (historicalRequests.length < 3) {
    // Not enough historical data to detect anomalies
    console.log(`Not enough historical data for branch ${request.branchId.name} (${historicalRequests.length} requests)`);
    return;
  }

  // Calculate average quantities and standard deviation per product
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

  // Calculate averages and standard deviations
  Object.keys(productStats).forEach(productId => {
    const stat = productStats[productId];
    stat.average = stat.total / stat.count;
    
    // Calculate standard deviation
    const variance = stat.quantities.reduce((acc: number, qty: number) => {
      return acc + Math.pow(qty - stat.average, 2);
    }, 0) / stat.count;
    stat.stdDev = Math.sqrt(variance);
  });

  // Check current request against historical patterns
  const anomalies: any[] = [];
  const threshold = 0.10; // 10% deviation threshold (reduced from 50%)

  request.items.forEach((item: any) => {
    const productId = item.productId._id.toString();
    const currentQuantity = item.requestedQuantity;

    if (productStats[productId]) {
      const stats = productStats[productId];
      const avgQuantity = stats.average;
      const deviation = Math.abs(currentQuantity - avgQuantity) / avgQuantity;

      if (deviation > threshold) {
        const anomalyType = currentQuantity > avgQuantity ? 'high' : 'low';
        const deviationPercent = Math.round(deviation * 100);
        
        anomalies.push({
          product: item.productId.name,
          productId: item.productId._id.toString(),
          currentQuantity,
          averageQuantity: Math.round(avgQuantity),
          standardDeviation: Math.round(stats.stdDev),
          deviation: deviationPercent,
          type: anomalyType,
          severity: deviationPercent > 50 ? 'critical' : deviationPercent > 25 ? 'high' : 'moderate'
        });
      }
    }
  });

  // If anomalies detected, notify admin and HR
  if (anomalies.length > 0) {
    const admins = await User.find({ 
      role: { $in: ['admin', 'hr'] },
      isActive: true 
    }).lean();

    // Create detailed anomaly message
    const anomalyDetails = anomalies.map(a => {
      const emoji = a.type === 'high' ? '📈' : '📉';
      const trend = a.type === 'high' ? 'higher' : 'lower';
      return `${emoji} ${a.product}: ${a.currentQuantity} units (${a.deviation}% ${trend} than avg of ${a.averageQuantity})`;
    }).join('\n');

    const summaryMessage = `${request.branchId.name} submitted request ${request.requestNumber} with ${anomalies.length} anomal${anomalies.length === 1 ? 'y' : 'ies'}. Requested by ${request.requestedBy.name}.`;

    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id.toString(),
        type: 'alert',
        title: '⚠️ Order Anomaly Detected',
        message: `${summaryMessage}\n\n${anomalyDetails}`,
        relatedEntityType: 'request',
        relatedEntityId: requestId
      });
    }

    console.log(`✅ Detected ${anomalies.length} anomalies in request ${request.requestNumber}`);
    return anomalies;
  }

  console.log(`✓ No anomalies detected in request ${request.requestNumber}`);
  return null;
}

/**
 * Get anomaly statistics for a specific branch
 */
export async function getBranchAnomalyStats(branchId: string, days: number = 30) {
  await connectDB();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const requests = await Request.find({
    branchId,
    createdAt: { $gte: startDate }
  }).lean();

  let totalAnomalies = 0;
  for (const request of requests) {
    const anomalies = await detectAnomalies(request._id.toString());
    if (anomalies) {
      totalAnomalies += anomalies.length;
    }
  }

  return {
    totalRequests: requests.length,
    totalAnomalies,
    anomalyRate: requests.length > 0 ? Math.round((totalAnomalies / requests.length) * 100) : 0
  };
}