import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Product from '@/lib/db/models/Product';
import Branch from '@/lib/db/models/Branch';

async function getProductDemand(startDate: Date) {
  const data = await Request.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalRequests: { $sum: 1 },
        totalQuantity: { $sum: '$items.requestedQuantity' },
        branches: { $addToSet: '$branchId' },
      },
    },
    { $sort: { totalQuantity: -1 } },
  ]);

  return await Promise.all(
    data.map(async (item: any) => {
      const product = await Product.findById(item._id).lean();
      return {
        product: product?.name || 'Unknown',
        totalRequests: item.totalRequests,
        totalQuantity: item.totalQuantity,
        branches: item.branches.map((b: any) => b.toString()),
      };
    })
  );
}

async function getProductDemandByTimeframe() {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayData = await getProductDemand(startOfToday);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const weekData = await getProductDemand(startOfWeek);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthData = await getProductDemand(startOfMonth);

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const yearData = await getProductDemand(startOfYear);

  return {
    today: todayData,
    week: weekData,
    month: monthData,
    year: yearData,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['warehouse_manager', 'admin', 'hr'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Status data
    const statusData = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Request trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const requestTrends = await Request.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top products
    const topProducts = await Request.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.requestedQuantity' },
          requestCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await Product.findById(item._id).lean();
        return {
          name: product?.name || 'Unknown',
          quantity: item.totalQuantity,
          requests: item.requestCount,
        };
      })
    );

    // Branch performance
    const branchPerformance = await Request.aggregate([
      {
        $group: {
          _id: '$branchId',
          totalRequests: { $sum: 1 },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          approvalRate: {
            $multiply: [{ $divide: ['$approvedRequests', '$totalRequests'] }, 100],
          },
        },
      },
      { $sort: { totalRequests: -1 } },
    ]);

    const branchPerformanceWithNames = await Promise.all(
      branchPerformance.map(async (item: any) => {
        const branch = await Branch.findById(item._id).lean();
        return {
          branch: branch?.name || 'Unknown',
          requests: item.totalRequests,
          approved: item.approvedRequests,
          approvalRate: Math.round(item.approvalRate),
        };
      })
    );

    // Monthly comparison
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMonthRequests = await Request.countDocuments({
      createdAt: {
        $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
      },
    });

    const lastMonthRequests = await Request.countDocuments({
      createdAt: {
        $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
      },
    });

    const monthlyData = [
      {
        month: lastMonth.toLocaleString('default', { month: 'short' }),
        requests: lastMonthRequests,
      },
      {
        month: currentMonth.toLocaleString('default', { month: 'short' }),
        requests: currentMonthRequests,
      },
    ];

    // Product demand by timeframe
    const productDemandData = await getProductDemandByTimeframe();

    return NextResponse.json({
      statusData,
      requestTrends,
      topProducts: topProductsWithNames,
      branchPerformance: branchPerformanceWithNames,
      monthlyData,
      productDemandData
    });

  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}