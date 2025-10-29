import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Link from 'next/link';

export default async function RequestHistoryPage() {
  const session = await getServerSession(authOptions);
  
  await connectDB();
  
  const allRequests = await Request.find({ branchId: session?.user.branchId })
    .populate('items.productId')
    .populate('reviewedBy')
    .sort({ createdAt: -1 })
    .lean();

  // Group by status
  const pendingRequests = allRequests.filter((r: any) => r.status === 'pending');
  const approvedRequests = allRequests.filter((r: any) => r.status === 'approved' || r.status === 'partially_approved');
  const rejectedRequests = allRequests.filter((r: any) => r.status === 'rejected');

  // Stats
  const stats = {
    total: allRequests.length,
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
    approvalRate: allRequests.length > 0 
      ? Math.round((approvedRequests.length / allRequests.length) * 100) 
      : 0
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Request History</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-blue-700 text-sm font-medium">Total Requests</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-green-700 text-sm font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <p className="text-purple-700 text-sm font-medium">Approval Rate</p>
          <p className="text-3xl font-bold text-purple-900">{stats.approvalRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">All Requests</h2>
          
          {allRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No requests found</p>
              <Link
                href="/branch/requests/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First Request
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allRequests.map((req: any) => (
                    <tr key={req._id.toString()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{req.requestNumber}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(req.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(req.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
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
                          <span className="text-green-700 font-medium">
                            {new Date(req.deliveryDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {req.reviewedBy?.name || <span className="text-gray-400">-</span>}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {allRequests.slice(0, 5).map((req: any) => (
            <div key={req._id.toString()} className="flex gap-4 items-start">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                req.status === 'pending' ? 'bg-yellow-500' :
                req.status === 'approved' ? 'bg-green-500' :
                req.status === 'partially_approved' ? 'bg-orange-500' :
                'bg-red-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{req.requestNumber}</p>
                    <p className="text-sm text-gray-600">
                      {req.status === 'pending' ? 'Request submitted and pending review' :
                       req.status === 'approved' ? `Fully approved - Delivery: ${new Date(req.deliveryDate).toLocaleDateString()}` :
                       req.status === 'partially_approved' ? 'Partially approved - Check details for quantities' :
                       'Request rejected'}
                    </p>
                    {(req.remarks || req.generalRemarks) && (
                      <p className="text-sm text-gray-500 italic mt-1">"{req.generalRemarks || req.remarks}"</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}