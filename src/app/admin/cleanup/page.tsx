'use client';

import { useState } from 'react';
import { Trash2, Calendar, CheckCircle } from 'lucide-react';

export default function CleanupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runCleanup = async () => {
    if (!confirm('This will delete all answered queries older than 30 days. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/cleanup/old-queries', {
        method: 'POST'
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        alert(`Successfully deleted ${data.deletedCount} old query notifications!`);
      } else {
        alert(data.error || 'Failed to run cleanup');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('An error occurred during cleanup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Cleanup</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Auto Cleanup Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <Calendar className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Automatic Cleanup Policy</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>📋 <strong>Regular Notifications:</strong> Auto-deleted after 24 hours</p>
                <p>❓ <strong>Query Notifications:</strong> Auto-deleted 30 days after being answered</p>
                <p>✅ <strong>Answered Queries:</strong> Kept for 30 days for reference, then automatically removed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Cleanup */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Manual Cleanup</h3>
          <p className="text-gray-600 mb-4">
            Run manual cleanup to immediately delete all answered query notifications older than 30 days.
          </p>

          <button
            onClick={runCleanup}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Trash2 size={20} />
            {loading ? 'Running Cleanup...' : 'Run Cleanup Now'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-green-900 mb-1">Cleanup Complete</h3>
                <p className="text-sm text-green-800">
                  Successfully deleted <strong>{result.deletedCount}</strong> old query notifications
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Cleanup Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Regular Notifications</p>
              <p className="text-2xl font-bold text-gray-900">24h</p>
              <p className="text-xs text-gray-500">Auto-delete period</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Query Notifications</p>
              <p className="text-2xl font-bold text-gray-900">30d</p>
              <p className="text-xs text-gray-500">Auto-delete period</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Last Cleanup</p>
              <p className="text-2xl font-bold text-gray-900">{result ? 'Just now' : 'Never'}</p>
              <p className="text-xs text-gray-500">{result ? `${result.deletedCount} deleted` : 'Run cleanup'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}