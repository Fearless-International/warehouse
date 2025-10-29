import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Complaint from '@/lib/db/models/Complaint';
import Link from 'next/link';

export default async function WarehouseDashboard() {
  await connectDB();
  
  const pendingRequests = await Request.find({ status: 'pending' })
    .populate('branchId')
    .populate('requestedBy')
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .lean();

  const stats = {
    pending: await Request.countDocuments({ status: 'pending' }),
    approved: await Request.countDocuments({ status: 'approved' }),
    rejected: await Request.countDocuments({ status: 'rejected' })
  };

  // Get recent complaints
  const recentComplaints = await Complaint.find()
    .populate('branchId')
    .populate('submittedBy')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const openComplaints = await Complaint.countDocuments({ status: 'open' });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
  <div className="flex gap-3">
    <Link 
      href="/warehouse/reports"
      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
    >
      📊 Reports
    </Link>
    <Link 
      href="/warehouse/products"
      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
    >
      📦 Manage Products
    </Link>
  </div>
</div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <p className="text-yellow-700 text-sm font-medium">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <p className="text-green-700 text-sm font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <p className="text-red-700 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
        </div>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
          <p className="text-orange-700 text-sm font-medium">Open Complaints</p>
          <p className="text-3xl font-bold text-orange-900">{openComplaints}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Pending Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingRequests.slice(0, 5).map((req: any) => (
                  <tr key={req._id.toString()}>
                    <td className="px-6 py-4 text-sm font-medium">{req.requestNumber}</td>
                    <td className="px-6 py-4 text-sm">{req.branchId?.name}</td>
                    <td className="px-6 py-4 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{req.items.length} items</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/warehouse/requests/${req._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Complaints</h2>
            <Link
              href="/warehouse/complaints"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentComplaints.map((complaint: any) => (
                <div key={complaint._id.toString()} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{complaint.subject}</p>
                      <p className="text-sm text-gray-600">{complaint.branchId?.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      complaint.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{complaint.description}</p>
                </div>
              ))}
              {recentComplaints.length === 0 && (
                <p className="text-center text-gray-500 py-4">No complaints</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}