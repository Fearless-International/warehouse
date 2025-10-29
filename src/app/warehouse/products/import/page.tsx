'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const router = useRouter();

  const downloadTemplate = () => {
    // Create sample Excel template
    const template = [
      {
        'Product Name': 'Crm Milk',
        'Category': 'CRM',
        'Unit': 'Ltr',
        'Quantity': 100,
        'Price': 5.50,
        'Supplier': 'ABC Dairy Ltd'
      },
      {
        'Product Name': 'Fresh Milk',
        'Category': 'RM',
        'Unit': 'Ltr',
        'Quantity': 50,
        'Price': 4.25,
        'Supplier': 'XYZ Farms'
      }
    ];

    // Convert to CSV for simplicity
    const headers = Object.keys(template[0]);
    const csvContent = [
      headers.join(','),
      ...template.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setDetails([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `Import completed!\n` +
          `✅ Created: ${data.created} new products\n` +
          `🔄 Updated: ${data.updated} existing products\n` +
          `⚠️ Skipped: ${data.skipped} products (due to errors)`
        );
        
        setTimeout(() => {
          router.push('/warehouse/products');
          router.refresh();
        }, 3000);
      } else {
        setError(data.error || 'Import failed');
        if (data.details && Array.isArray(data.details)) {
          setDetails(data.details);
        }
      }
    } catch (err) {
      setError('An error occurred during import');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Import Products from Excel</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm font-bold text-blue-900 mb-2">📋 Excel Format Required:</p>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Product Name</strong> - Product name (required)</p>
            <p>• <strong>Category</strong> - CRM, RM, Beverage, Packaging, or Other (required)</p>
            <p>• <strong>Unit</strong> - Pcs, Kg, Ltr, Ctns, Btl, Can, Box, Pack (required)</p>
            <p>• <strong>Quantity</strong> - Initial stock quantity (required, number)</p>
            <p>• <strong>Price</strong> - Cost per unit (optional, number)</p>
            <p>• <strong>Supplier</strong> - Supplier name (optional, text)</p>
          </div>
        </div>

        {/* Download Template Button */}
        <button
          type="button"
          onClick={downloadTemplate}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          <Download size={20} />
          Download Sample Template
        </button>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-sm font-bold text-yellow-900 mb-2">⚠️ Important Notes:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• If a product already exists, its quantity will be <strong>added</strong> to existing stock</li>
            <li>• New products will be created with the specified quantity</li>
            <li>• All products will be set as active by default</li>
            <li>• Make sure column headers match exactly as shown above</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold mb-2">❌ {error}</p>
            {details.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto">
                <p className="text-sm font-semibold text-red-800 mb-1">Validation Errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {details.map((detail, idx) => (
                    <li key={idx}>• {detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-semibold whitespace-pre-line">{success}</p>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Excel File <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? '⏳ Importing...' : '📤 Import Products'}
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
      </div>
    </div>
  );
}