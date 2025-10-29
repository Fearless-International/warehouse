'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';

interface ReviewFormProps {
  requestId: string;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      quantity: number;
    };
    requestedQuantity: number;
    currentStock: number;
  }>;
}

export default function ReviewForm({ requestId, items }: ReviewFormProps) {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [itemReviews, setItemReviews] = useState(
    items.map(item => ({
      productId: item.productId._id,
      productName: item.productId.name,
      requestedQuantity: item.requestedQuantity,
      branchReportedStock: item.currentStock,
      actualStock: item.productId.quantity,
      availability: 'available' as 'available' | 'not_available' | 'partially_available',
      approvedQuantity: item.requestedQuantity,
      itemRemarks: '',
      restockDate: '',
      canFulfillAfterRestock: false
    }))
  );

  const updateItemReview = (productId: string, field: string, value: any) => {
    setItemReviews(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleAvailabilityChange = (productId: string, availability: 'available' | 'not_available' | 'partially_available') => {
    const item = itemReviews.find(i => i.productId === productId);
    
    if (availability === 'available') {
      updateItemReview(productId, 'availability', 'available');
      updateItemReview(productId, 'approvedQuantity', item?.requestedQuantity || 0);
      updateItemReview(productId, 'canFulfillAfterRestock', false);
      updateItemReview(productId, 'restockDate', '');
    } else if (availability === 'not_available') {
      updateItemReview(productId, 'availability', 'not_available');
      updateItemReview(productId, 'approvedQuantity', 0);
      // For not available, enable restock option
    } else if (availability === 'partially_available') {
      updateItemReview(productId, 'availability', 'partially_available');
      updateItemReview(productId, 'canFulfillAfterRestock', false);
      updateItemReview(productId, 'restockDate', '');
    }
  };

  const handleReview = async () => {
    // Check if ALL items are not available
    const allNotAvailable = itemReviews.every(i => i.availability === 'not_available');
    const hasAvailableOrPartial = itemReviews.some(i => i.availability === 'available' || i.availability === 'partially_available');

    // Validation 1: If ANY item is available or partial, delivery date is REQUIRED
    if (hasAvailableOrPartial && !deliveryDate) {
      alert('Please select a delivery date for available items');
      return;
    }

    // Validation 2: For NOT AVAILABLE items, restock date is REQUIRED
    const notAvailableItems = itemReviews.filter(i => i.availability === 'not_available');
    for (const item of notAvailableItems) {
      if (!item.restockDate) {
        alert(`Please specify restock date for unavailable item: ${item.productName}`);
        return;
      }
    }

    // Validation 3: Partial items need approved quantity
    for (const item of itemReviews) {
      if (item.availability === 'partially_available') {
        if (!item.approvedQuantity || item.approvedQuantity <= 0) {
          alert(`Please specify approved quantity for ${item.productName}`);
          return;
        }
        if (item.approvedQuantity > item.actualStock) {
          alert(`Approved quantity for ${item.productName} cannot exceed actual stock (${item.actualStock})`);
          return;
        }
        if (item.approvedQuantity >= item.requestedQuantity) {
          alert(`For ${item.productName}: Use "Available" if you can deliver full quantity. Partial is for less than requested.`);
          return;
        }
      }
    }

    // Determine overall status
    const allAvailable = itemReviews.every(i => i.availability === 'available');
    
    let status: 'approved' | 'rejected' | 'partially_approved';
    if (allAvailable) {
      status = 'approved';
    } else if (allNotAvailable) {
      status = 'rejected';
    } else {
      status = 'partially_approved';
    }

    const message = status === 'approved' 
      ? 'Approve this request? Stock will be deducted from inventory.'
      : status === 'rejected'
      ? 'Reject this entire request? All items are unavailable.'
      : 'Partially approve this request? Only approved quantities will be deducted from inventory.';

    if (!confirm(message)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/requests/${requestId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          deliveryDate: hasAvailableOrPartial ? deliveryDate : null, // Only send if needed
          generalRemarks,
          items: itemReviews
        })
      });

      if (response.ok) {
        alert(`Request ${status.replace('_', ' ')} successfully!`);
        router.push('/warehouse');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update request');
      }
    } catch (error) {
      alert('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if delivery date should be shown
  const hasAvailableOrPartial = itemReviews.some(i => i.availability === 'available' || i.availability === 'partially_available');
  const allNotAvailable = itemReviews.every(i => i.availability === 'not_available');

  return (
    <div className="border-t pt-6 space-y-6">
      {/* Items Review Section */}
      <div>
        <h3 className="font-bold text-lg mb-4">Review Each Item:</h3>
        <div className="space-y-4">
          {itemReviews.map((review) => (
            <div key={review.productId} className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
              {/* Product Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{review.productName}</p>
                    <div className="text-sm space-y-1 mt-1">
                      <p className="text-gray-600">
                        Requested: <span className="font-bold text-orange-600">{review.requestedQuantity}</span>
                      </p>
                      <p className="text-gray-600">
                        Branch Reported Stock: <span className="font-bold text-blue-600">{review.branchReportedStock}</span>
                      </p>
                      <p className="text-gray-600">
                        Actual Warehouse Stock: <span className="font-bold text-green-600">{review.actualStock}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Buttons */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Availability Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAvailabilityChange(review.productId, 'available')}
                    disabled={review.actualStock < review.requestedQuantity}
                    className={`px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      review.availability === 'available'
                        ? 'bg-green-600 text-white shadow-lg'
                        : review.actualStock < review.requestedQuantity
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    <CheckCircle size={18} />
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAvailabilityChange(review.productId, 'partially_available')}
                    disabled={review.actualStock === 0}
                    className={`px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      review.availability === 'partially_available'
                        ? 'bg-yellow-600 text-white shadow-lg'
                        : review.actualStock === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                    }`}
                  >
                    <AlertCircle size={18} />
                    Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAvailabilityChange(review.productId, 'not_available')}
                    className={`px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      review.availability === 'not_available'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                    }`}
                  >
                    <XCircle size={18} />
                    Not Available
                  </button>
                </div>
              </div>

              {/* Approved Quantity (for partial availability) */}
              {review.availability === 'partially_available' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Specify Quantity You Can Provide
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max={Math.min(review.requestedQuantity - 1, review.actualStock)}
                      value={review.approvedQuantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const maxAllowed = Math.min(review.requestedQuantity - 1, review.actualStock);
                        updateItemReview(review.productId, 'approvedQuantity', Math.min(Math.max(value, 1), maxAllowed));
                      }}
                      className="flex-1 px-4 py-3 border-2 border-yellow-400 rounded-lg focus:outline-none focus:border-yellow-600 font-bold text-xl"
                    />
                    <div className="text-sm text-gray-700 bg-white px-3 py-2 rounded border">
                      <p>Max: <span className="font-bold">{Math.min(review.requestedQuantity - 1, review.actualStock)}</span></p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
                    <p className="text-xs text-gray-700">
                      💡 <strong>Requested:</strong> {review.requestedQuantity} | 
                      <strong> Available:</strong> {review.actualStock} | 
                      <strong> Can Provide:</strong> {review.approvedQuantity}
                    </p>
                  </div>
                </div>
              )}

              {/* Restock Date - REQUIRED for Not Available items */}
              {review.availability === 'not_available' && (
                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-red-700 mb-2">
                      ❌ This item is not available
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-red-900 mb-2">
                      Expected Restock Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={review.restockDate}
                      onChange={(e) => updateItemReview(review.productId, 'restockDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:outline-none focus:border-red-600"
                      required
                    />
                    <p className="text-xs text-red-700 mt-2">
                      📦 Branch will be notified when this item will be restocked
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Restock Date for Insufficient Stock (Available/Partial) */}
              {review.availability !== 'not_available' && review.requestedQuantity > review.actualStock && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      id={`restock-${review.productId}`}
                      checked={review.canFulfillAfterRestock}
                      onChange={(e) => updateItemReview(review.productId, 'canFulfillAfterRestock', e.target.checked)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor={`restock-${review.productId}`} className="flex-1">
                      <p className="font-bold text-blue-900">Full quantity available after restocking</p>
                      <p className="text-sm text-blue-700">
                        Requested: <strong>{review.requestedQuantity}</strong> | 
                        Current: <strong>{review.actualStock}</strong> | 
                        Need: <strong>{review.requestedQuantity - review.actualStock}</strong> more
                      </p>
                    </label>
                  </div>

                  {review.canFulfillAfterRestock && (
                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-2">
                        Expected Restock Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={review.restockDate}
                        onChange={(e) => updateItemReview(review.productId, 'restockDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                      <p className="text-xs text-blue-700 mt-2">
                        💡 Branch will be notified that full quantity will be available after this date
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Available Full Quantity Message */}
              {review.availability === 'available' && (
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-semibold">
                    ✅ Full quantity ({review.requestedQuantity}) will be provided.
                  </p>
                </div>
              )}

              {/* Item Remarks */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Item-Specific Remarks (Optional)
                </label>
                <textarea
                  value={review.itemRemarks}
                  onChange={(e) => updateItemReview(review.productId, 'itemRemarks', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={2}
                  placeholder="Notes for this item (e.g., 'Restocking next week')..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Date - Only show if ANY item is available or partial */}
      {hasAvailableOrPartial && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Delivery Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Required for available and partial items</p>
        </div>
      )}

      {/* Info message when all not available */}
      {allNotAvailable && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800">
            ℹ️ All items are unavailable. Delivery date is not required. Please ensure all items have restock dates.
          </p>
        </div>
      )}

      {/* General Remarks */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">General Remarks</label>
        <textarea
          value={generalRemarks}
          onChange={(e) => setGeneralRemarks(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Overall comments about this request..."
        />
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">Review Summary:</h4>
        <div className="space-y-1 text-sm text-blue-900">
          <p>✅ Available: <strong>{itemReviews.filter(i => i.availability === 'available').length}</strong></p>
          <p>⚠️ Partially Available: <strong>{itemReviews.filter(i => i.availability === 'partially_available').length}</strong></p>
          <p>❌ Not Available: <strong>{itemReviews.filter(i => i.availability === 'not_available').length}</strong></p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleReview}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {loading ? 'Processing...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}