'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditProductFormProps {
  product: {
    _id: string;
    name: string;
    category: string;
    unit: string;
    quantity: number;
    price: number;
    supplier?: string;
    isActive: boolean;
  };
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    unit: product.unit,
    quantity: product.quantity || 0,
    price: product.price || 0,
    supplier: product.supplier || '',
    isActive: product.isActive
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    if (formData.price < 0) {
      alert('Price cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Product updated successfully!');
        router.push('/warehouse/products');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update product');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="CRM">CRM</option>
            <option value="RM">RM</option>
            <option value="Beverage">Beverage</option>
            <option value="Packaging">Packaging</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pcs">Pcs</option>
            <option value="Kg">Kg</option>
            <option value="Ltr">Ltr</option>
            <option value="Ctns">Ctns</option>
            <option value="Btl">Btl</option>
            <option value="Can">Can</option>
            <option value="Box">Box</option>
            <option value="Pack">Pack</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Current Quantity <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Current stock quantity</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Price per Unit
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Cost per unit</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Supplier Name
        </label>
        <input
          type="text"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Supplier company or person"
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="font-medium">
          Product is Active
        </label>
        <p className="text-sm text-gray-500 ml-auto">
          {formData.isActive ? '✅ Available for orders' : '❌ Hidden from branches'}
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? 'Updating...' : 'Update Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}