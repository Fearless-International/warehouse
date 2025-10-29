'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QueryResponseForm({ queryId }: { queryId: string }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/anomaly-queries/${queryId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchResponse: response })
      });

      if (res.ok) {
        alert('Response sent successfully!');
        router.push('/branch/queries');
        router.refresh();
      } else {
        alert('Failed to send response');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6">
      <h3 className="font-bold mb-4">Your Response</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Please explain the reason for the unusual quantities
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Example: We have a special event coming up, increased customer demand, seasonal requirements, etc."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Sending Response...' : 'Submit Response'}
        </button>
      </form>
    </div>
  );
}