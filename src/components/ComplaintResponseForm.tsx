'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplaintResponseForm({ complaintId, currentStatus }: any) {
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/${complaintId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, status })
      });

      if (res.ok) {
        setResponse('');
        alert('Response sent successfully!');
        router.refresh();
      } else {
        alert('Failed to submit response');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6">
      <h3 className="font-bold mb-4">Add Response / Update Status</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Response</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Type your response or additional notes..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Submitting...' : 'Submit Response'}
        </button>
      </form>
    </div>
  );
}