'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  price: number;
  supplier?: string;
  isActive: boolean;
}

interface ProductActionsClientProps {
  products: Product[];
}

export default function ProductActionsClient({ products }: ProductActionsClientProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone. If this product is used in requests, you'll need to mark it as inactive instead.`)) {
      return;
    }

    setDeletingId(productId);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Product deleted successfully!');
        router.refresh();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <p className="text-gray-500 mb-4">No products found</p>
                  <Link
                    href="/warehouse/products/new"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Your First Product
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.category === 'CRM' ? 'bg-purple-100 text-purple-800' :
                      product.category === 'RM' ? 'bg-green-100 text-green-800' :
                      product.category === 'Beverage' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{product.unit}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold ${
                      (product.quantity || 0) === 0 ? 'text-red-600' :
                      (product.quantity || 0) < 10 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {product.quantity || 0}
                    </span>
                    {(product.quantity || 0) < 10 && (
                      <span className="ml-2 text-xs text-red-600">⚠️ Low</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {product.price ? `$${product.price.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.supplier || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/warehouse/products/${product._id}/edit`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deletingId === product._id}
                        className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}