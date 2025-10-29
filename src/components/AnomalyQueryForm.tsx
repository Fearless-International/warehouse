'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnomalyQueryForm({ requestId, branchId, anomalies }: any) {
  const [queryMessage, setQueryMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/anomaly-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          branchId,
          anomalyDetails: anomalies,
          queryMessage
        })
      });

      if (response.ok) {
        alert('Query sent to branch successfully!');
        router.push('/warehouse/anomalies');
      } else {
        alert('Failed to send query');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold mb-4">Send Query to Branch</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Query</label>
          <textarea
            value={queryMessage}
            onChange={(e) => setQueryMessage(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ask the branch manager to explain the unusual quantities..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Sending Query...' : 'Send Query to Branch'}
        </button>
      </form>
    </div>
  );
}