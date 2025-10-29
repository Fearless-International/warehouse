import connectDB from '@/lib/db/mongodb';
import Complaint from '@/lib/db/models/Complaint';
import Link from 'next/link';

export default async function WarehouseComplaintsPage() {
  await connectDB();
  
  const complaints = await Complaint.find()
    .populate('branchId')
    .populate('submittedBy')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Complaints Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {complaints.map((complaint: any) => (
              <tr key={complaint._id.toString()} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{complaint.subject}</td>
                <td className="px-6 py-4 text-sm">{complaint.branchId?.name}</td>
                <td className="px-6 py-4 text-sm">{complaint.category}</td>
                <td className="px-6 py-4 text-sm">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    complaint.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/warehouse/complaints/${complaint._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View/Respond
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}