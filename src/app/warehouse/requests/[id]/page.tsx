import connectDB from '@/lib/db/mongodb';
import Request from '@/lib/db/models/Request';
import Product from '@/lib/db/models/Product';
import ReviewForm from '@/components/ReviewForm';
import { notFound } from 'next/navigation';

export default async function RequestReviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15 requirement)
  const resolvedParams = await params;
  
  await connectDB();
  
  const request = await Request.findById(resolvedParams.id)
    .populate('branchId')
    .populate('requestedBy')
    .populate('items.productId')
    .lean();

  if (!request) notFound();

  if (request.status !== 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">Request Already Reviewed</h2>
          <p className="text-yellow-700">This request has already been {request.status}.</p>
        </div>
      </div>
    );
  }

  // Fetch current actual stock for all requested products
  const productIds = request.items.map((item: any) => item.productId._id);
  const currentProducts = await Product.find({ _id: { $in: productIds } }).lean();
  
  // Map current stock to items
  const itemsWithCurrentStock = request.items.map((item: any) => {
    const currentProduct = currentProducts.find(
      (p: any) => p._id.toString() === item.productId._id.toString()
    );
    
    return {
      productId: {
        _id: item.productId._id.toString(),
        name: item.productId.name,
        category: item.productId.category,
        unit: item.productId.unit,
        quantity: currentProduct?.quantity || 0 // Current actual stock from Products table
      },
      requestedQuantity: item.requestedQuantity,
      currentStock: item.currentStock // Stock at time of request (from branch)
    };
  });

  // Convert request to plain object
  const plainRequest = {
    _id: request._id.toString(),
    requestNumber: request.requestNumber,
    branchId: {
      _id: request.branchId._id.toString(),
      name: request.branchId.name
    },
    requestedBy: {
      _id: request.requestedBy._id.toString(),
      name: request.requestedBy.name
    },
    createdAt: request.createdAt?.toString() || request.submittedAt?.toString(),
    items: itemsWithCurrentStock
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Review Request</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Request Number</p>
            <p className="font-bold">{plainRequest.requestNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Branch</p>
            <p className="font-bold">{plainRequest.branchId.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Requested By</p>
            <p className="font-bold">{plainRequest.requestedBy.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-bold">{new Date(plainRequest.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <h3 className="font-bold mb-4">Products Requested:</h3>
        <table className="w-full mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Stock (Branch Reported)</th>
              <th className="px-4 py-2 text-left">Actual Stock (Warehouse)</th>
              <th className="px-4 py-2 text-left">Requested Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {plainRequest.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-medium">{item.productId.name}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">{item.currentStock}</td>
                <td className="px-4 py-3 text-green-600 font-bold">{item.productId.quantity}</td>
                <td className="px-4 py-3 text-orange-600 font-bold">{item.requestedQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ReviewForm requestId={plainRequest._id} items={plainRequest.items} />
      </div>
    </div>
  );
}