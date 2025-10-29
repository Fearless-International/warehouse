import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import User from '@/lib/db/models/User';
import Branch from '@/lib/db/models/Branch';
import Product from '@/lib/db/models/Product';
import Complaint from '@/lib/db/models/Complaint';
import Link from 'next/link';

export default async function HRDashboard() {
  await connectDB();

  // Overall Stats
  const totalRequests = await Request.countDocuments();
  const totalBranches = await Branch.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const pendingRequests = await Request.countDocuments({ status: 'pending' });

  // Recent Activity
  const recentRequests = await Request.find()
    .populate('branchId')
    .populate('requestedBy')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Branch Activity
  const branchActivity = await Request.aggregate([
    {
      $group: {
        _id: '$branchId',
        totalRequests: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    },
    { $sort: { totalRequests: -1 } },
    { $limit: 10 }
  ]);

  const branchActivityWithNames = await Promise.all(
    branchActivity.map(async (item: any) => {
      const branch = await Branch.findById(item._id).lean();
      return {
        ...item,
        branchName: branch?.name || 'Unknown'
      };
    })
  );

  // Complaints Summary
  const resolvedComplaints = await Complaint.find({ status: 'resolved' })
    .populate('branchId')
    .populate('submittedBy')
    .sort({ respondedAt: -1 })
    .limit(5)
    .lean();

  const complaintStats = {
    open: await Complaint.countDocuments({ status: 'open' }),
    inProgress: await Complaint.countDocuments({ status: 'in_progress' }),
    resolved: await Complaint.countDocuments({ status: 'resolved' }),
    closed: await Complaint.countDocuments({ status: 'closed' })
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <Link 
          href="/hr/analytics"
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          📊 Detailed Analytics
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <p className="text-blue-700 text-sm font-medium">Total Requests</p>
          <p className="text-3xl font-bold text-blue-900">{totalRequests}</p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">{pendingRequests}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <p className="text-green-700 text-sm font-medium">Total Branches</p>
          <p className="text-3xl font-bold text-green-900">{totalBranches}</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
          <p className="text-purple-700 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-purple-900">{totalUsers}</p>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
          <p className="text-orange-700 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-orange-900">{totalProducts}</p>
        </div>
      </div>

      {/* Complaints Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complaints Overview</h2>
          <Link href="/warehouse/complaints" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-900">{complaintStats.open}</p>
            <p className="text-sm text-yellow-700">Open</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">{complaintStats.inProgress}</p>
            <p className="text-sm text-blue-700">In Progress</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-900">{complaintStats.resolved}</p>
            <p className="text-sm text-green-700">Resolved</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{complaintStats.closed}</p>
            <p className="text-sm text-gray-700">Closed</p>
          </div>
        </div>

        <h3 className="font-bold mb-3">Recently Resolved Complaints</h3>
        <div className="space-y-3">
          {resolvedComplaints.map((complaint: any) => (
            <div key={complaint._id.toString()} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{complaint.subject}</p>
                  <p className="text-sm text-gray-600">{complaint.branchId?.name} - {complaint.category}</p>
                  {complaint.response && (
                    <p className="text-sm text-gray-700 mt-2 italic">"{complaint.response.substring(0, 100)}..."</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(complaint.respondedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {resolvedComplaints.length === 0 && (
            <p className="text-center text-gray-500 py-4">No resolved complaints yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Requests</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentRequests.map((req: any) => (
                <div key={req._id.toString()} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{req.requestNumber}</p>
                    <p className="text-sm text-gray-600">{req.branchId?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Branch Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {branchActivityWithNames.map((branch: any) => (
                <div key={branch._id.toString()} className="border rounded-lg p-4">
                  <p className="font-bold mb-2">{branch.branchName}</p>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-bold text-lg">{branch.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Approved</p>
                      <p className="font-bold text-green-600">{branch.approved}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rejected</p>
                      <p className="font-bold text-red-600">{branch.rejected}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pending</p>
                      <p className="font-bold text-yellow-600">{branch.pending}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}