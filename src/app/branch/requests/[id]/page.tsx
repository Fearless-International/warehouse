import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Package, Calendar, User } from 'lucide-react';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/branch/history" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to History
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Request Details</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Package size={16} />
              Request Number
            </p>
            <p className="font-bold text-lg mt-1">{request.requestNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'approved' ? 'bg-green-100 text-green-800' :
              request.status === 'partially_approved' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {request.status === 'pending' && '⏳'}
              {request.status === 'approved' && '✅'}
              {request.status === 'partially_approved' && '⚠️'}
              {request.status === 'rejected' && '❌'}
              {request.status === 'partially_approved' ? 'PARTIALLY APPROVED' : request.status.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar size={16} />
              Submitted Date
            </p>
            <p className="font-medium mt-1">{new Date(request.submittedAt).toLocaleString()}</p>
          </div>
          {request.deliveryDate && (
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                Expected Delivery
              </p>
              <p className="font-bold text-green-700 text-lg mt-1">
                {new Date(request.deliveryDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {request.reviewedAt && (
            <div>
              <p className="text-sm text-gray-600">Reviewed Date</p>
              <p className="font-medium mt-1">{new Date(request.reviewedAt).toLocaleString()}</p>
            </div>
          )}
          {request.reviewedBy && (
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User size={16} />
                Reviewed By
              </p>
              <p className="font-medium mt-1">{request.reviewedBy.name}</p>
            </div>
          )}
        </div>

        {/* General Remarks */}
        {(request.generalRemarks || request.remarks) && (
          <div className="mb-6 pb-6 border-b">
            <p className="text-sm font-bold text-gray-700 mb-2">Warehouse Manager's Comments</p>
            <div className={`p-4 rounded-lg ${
              request.status === 'approved' ? 'bg-green-50 border-l-4 border-green-500' :
              request.status === 'partially_approved' ? 'bg-orange-50 border-l-4 border-orange-500' :
              request.status === 'rejected' ? 'bg-red-50 border-l-4 border-red-500' :
              'bg-gray-50'
            }`}>
              <p className="text-gray-800">{request.generalRemarks || request.remarks}</p>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div>
          <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
            <Package size={20} />
            Products Review
          </h3>
          
          {request.status === 'pending' ? (
            // Pending Request - Show Simple View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock at Request</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Requested Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {request.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-medium">{item.productId?.name}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">{item.currentStock}</td>
                      <td className="px-4 py-3 text-orange-600 font-bold">{item.requestedQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Reviewed Request - Show Detailed View with Approval Status
            <div className="space-y-4">
              {request.items.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`border-2 rounded-lg p-4 ${
                    item.availability === 'available' ? 'border-green-300 bg-green-50' :
                    item.availability === 'partially_available' ? 'border-orange-300 bg-orange-50' :
                    item.availability === 'not_available' ? 'border-red-300 bg-red-50' :
                    'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        item.availability === 'available' ? 'bg-green-200' :
                        item.availability === 'partially_available' ? 'bg-orange-200' :
                        item.availability === 'not_available' ? 'bg-red-200' :
                        'bg-gray-200'
                      }`}>
                        {item.availability === 'available' && <CheckCircle className="text-green-700" size={24} />}
                        {item.availability === 'partially_available' && <AlertCircle className="text-orange-700" size={24} />}
                        {item.availability === 'not_available' && <XCircle className="text-red-700" size={24} />}
                        {!item.availability && <Package className="text-gray-700" size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{item.productId?.name}</p>
                        <div className="flex gap-4 text-sm mt-1">
                          <span className="text-gray-600">
                            Stock at Request: <span className="font-semibold text-blue-600">{item.currentStock}</span>
                          </span>
                          <span className="text-gray-600">
                            Requested: <span className="font-semibold text-orange-600">{item.requestedQuantity}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.availability === 'available' ? 'bg-green-200 text-green-800' :
                      item.availability === 'partially_available' ? 'bg-orange-200 text-orange-800' :
                      item.availability === 'not_available' ? 'bg-red-200 text-red-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {item.availability === 'available' && '✅ AVAILABLE'}
                      {item.availability === 'partially_available' && '⚠️ PARTIAL'}
                      {item.availability === 'not_available' && '❌ NOT AVAILABLE'}
                      {!item.availability && 'PENDING'}
                    </span>
                  </div>

                  {/* Approved Quantity Info */}
                  {item.availability && item.availability !== 'not_available' && (
                    <div className={`p-3 rounded-lg mb-3 ${
                      item.availability === 'available' ? 'bg-white border border-green-300' :
                      'bg-white border border-orange-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-700">Approved Quantity:</p>
                          <p className="text-2xl font-bold text-green-700">
                            {item.approvedQuantity || 0} {item.productId?.unit}
                          </p>
                        </div>
                        
                        {item.availability === 'partially_available' && (
                          <div className="text-right">
                            <p className="text-xs text-gray-600">You will receive</p>
                            <p className="text-lg font-bold text-orange-700">
                              {Math.round((item.approvedQuantity / item.requestedQuantity) * 100)}% of request
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* RESTOCK DATE - For NOT AVAILABLE items */}
                  {item.availability === 'not_available' && item.restockDate && (
                    <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          <Calendar className="text-blue-700" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900">Expected Restock Date</p>
                          <p className="text-lg font-bold text-blue-700">
                            {new Date(item.restockDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2 pl-13">
                        📦 This item will be restocked on the date above
                      </p>
                    </div>
                  )}

                  {/* Restock Information - For items available after restocking */}
                  {item.canFulfillAfterRestock && item.restockDate && (
                    <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          <Calendar className="text-blue-700" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900">Full Quantity Available After Restocking</p>
                          <p className="text-lg font-bold text-blue-700">
                            {new Date(item.restockDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2 pl-13">
                        📦 Full requested quantity ({item.requestedQuantity}) will be available after restocking
                      </p>
                    </div>
                  )}

                  {/* Item-Specific Remarks */}
                  {item.itemRemarks && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-300">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Warehouse Notes:</p>
                      <p className="text-sm text-gray-700 italic">"{item.itemRemarks}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Card for Reviewed Requests */}
      {request.status !== 'pending' && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-300">
          <h3 className="font-bold text-lg mb-4 text-blue-900">📊 Request Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{request.items.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Fully Approved</p>
              <p className="text-2xl font-bold text-green-700">
                {request.items.filter((i: any) => i.availability === 'available').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Partially Approved</p>
              <p className="text-2xl font-bold text-orange-700">
                {request.items.filter((i: any) => i.availability === 'partially_available').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Not Available</p>
              <p className="text-2xl font-bold text-red-700">
                {request.items.filter((i: any) => i.availability === 'not_available').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <Link
          href="/branch/history"
          className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Back to History
        </Link>
        {request.status === 'pending' && (
          <button
            className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 font-medium transition-colors"
            disabled
          >
            ⏳ Awaiting Review
          </button>
        )}
      </div>
    </div>
  );
}