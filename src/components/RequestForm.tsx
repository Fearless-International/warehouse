'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestForm({ products, branchName }: any) {
  const [items, setItems] = useState([{ productId: '', currentStock: 0, requestedQuantity: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const addItem = () => {
    setItems([...items, { productId: '', currentStock: 0, requestedQuantity: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate
    const validItems = items.filter(item => item.productId && item.requestedQuantity > 0);
    if (validItems.length === 0) {
      setError('Please add at least one valid product');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems })
      });

      if (response.ok) {
        router.push('/branch');
        router.refresh();
      } else {
        setError('Failed to submit request');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <p className="text-gray-600"><strong>Branch:</strong> {branchName}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5">
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Product</option>
                {products.map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Current Stock</label>
              <input
                type="number"
                value={item.currentStock}
                onChange={(e) => updateItem(index, 'currentStock', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Requested Qty</label>
              <input
                type="number"
                value={item.requestedQuantity}
                onChange={(e) => updateItem(index, 'requestedQuantity', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div className="col-span-1">
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mb-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
      >
        + Add Another Product
      </button>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          ⏱️ <strong>Note:</strong> Approval may take up to 24-48 hours. You will be notified once processed.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}