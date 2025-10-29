import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function HRRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectDB();
  
  const request = await Request.findById(id)
    .populate('branchId')
    .populate('requestedBy')
    .populate('reviewedBy')
    .populate('items.productId')
    .lean();

  if (!request) notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/hr/anomalies" className="text-blue-600 hover:text-blue-800">
          ← Back to Anomalies
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Request Details (View Only)</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600">Request Number</p>
            <p className="font-bold text-lg">{request.requestNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {request.status.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Branch</p>
            <p className="font-bold">{request.branchId?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Requested By</p>
            <p className="font-medium">{request.requestedBy?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted Date</p>
            <p className="font-medium">{new Date(request.submittedAt).toLocaleString()}</p>
          </div>
          {request.deliveryDate && (
            <div>
              <p className="text-sm text-gray-600">Expected Delivery Date</p>
              <p className="font-bold text-green-700 text-lg">
                {new Date(request.deliveryDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {request.reviewedAt && (
            <div>
              <p className="text-sm text-gray-600">Reviewed Date</p>
              <p className="font-medium">{new Date(request.reviewedAt).toLocaleString()}</p>
            </div>
          )}
          {request.reviewedBy && (
            <div>
              <p className="text-sm text-gray-600">Reviewed By</p>
              <p className="font-medium">{request.reviewedBy.name}</p>
            </div>
          )}
        </div>

        {/* Remarks */}
        {request.remarks && (
          <div className="mb-6 pb-6 border-b">
            <p className="text-sm text-gray-600 mb-2">Warehouse Remarks</p>
            <div className={`p-4 rounded-lg ${
              request.status === 'approved' ? 'bg-green-50 border-l-4 border-green-500' :
              request.status === 'rejected' ? 'bg-red-50 border-l-4 border-red-500' :
              'bg-gray-50'
            }`}>
              <p className="text-gray-800">{request.remarks}</p>
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h3 className="font-bold mb-4 text-lg">Products Requested</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Requested Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {request.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-3">{item.productId?.name}</td>
                    <td className="px-4 py-3">{item.currentStock}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{item.requestedQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This is a read-only view. Only the Warehouse Manager can approve or reject requests.
        </p>
      </div>
    </div>
  );
}