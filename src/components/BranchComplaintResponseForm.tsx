'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BranchComplaintResponseForm({ complaintId }: { complaintId: string }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/${complaintId}/branch-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (res.ok) {
        setMessage('');
        alert('Response sent successfully!');
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
      <h3 className="font-bold mb-4">Reply to Warehouse</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Type your response or follow-up question..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Sending...' : 'Send Response'}
        </button>
      </form>
    </div>
  );
}