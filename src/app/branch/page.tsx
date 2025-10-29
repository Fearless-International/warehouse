import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';

export default async function BranchDashboard() {
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const requests = await Request.find({ branchId: session?.user.branchId })
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const stats = {
    pending: await Request.countDocuments({ branchId: session?.user.branchId, status: 'pending' }),
    approved: await Request.countDocuments({ 
      branchId: session?.user.branchId, 
      status: { $in: ['approved', 'partially_approved'] } 
    }),
    rejected: await Request.countDocuments({ branchId: session?.user.branchId, status: 'rejected' })
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Branch Dashboard</h1>
        <div className="flex gap-3">
          <Link 
            href="/branch/history"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            📜 History
          </Link>
          <Link 
            href="/branch/complaints"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            📋 Complaints
          </Link>
          <Link 
            href="/branch/requests/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <p className="text-green-700 text-sm font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
          <p className="text-xs text-green-600 mt-1">Includes partial approvals</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Requests</h2>
          <Link 
            href="/branch/history"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery/Restock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="mb-4">No requests yet</p>
                    <Link
                      href="/branch/requests/new"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Create Your First Request
                    </Link>
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => {
                  // Check if any items have restock dates
                  const hasRestockDates = req.items.some((item: any) => item.restockDate);
                  const allNotAvailable = req.items.every((item: any) => item.availability === 'not_available');
                  
                  return (
                    <tr key={req._id.toString()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{req.requestNumber}</td>
                      <td className="px-6 py-4 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        {req.items.length} item{req.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'partially_approved' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status === 'partially_approved' ? 'Partial' : req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {req.deliveryDate ? (
                          <div>
                            <span className="text-green-700 font-medium">
                              📦 {new Date(req.deliveryDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : allNotAvailable && hasRestockDates ? (
                          <Link 
                            href={`/branch/requests/${req._id}`}
                            className="text-blue-700 font-medium hover:text-blue-900 hover:underline inline-flex items-center gap-1"
                          >
                            🔄 See restock dates
                          </Link>
                        ) : req.status === 'pending' ? (
                          <span className="text-gray-500 italic">Pending review</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/branch/requests/${req._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}