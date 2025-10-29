import connectDB from '@/lib/db/mongodb';
import Complaint from '@/lib/db/models/Complaint';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import ComplaintResponseForm from '@/components/ComplaintResponseForm';

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectDB();
  
  const complaint = await Complaint.findById(id)
    .populate('branchId')
    .populate('submittedBy')
    .populate('respondedBy')
    .populate('conversation.sender')
    .lean();

  if (!complaint) notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Complaint Details</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600">Branch</p>
            <p className="font-bold text-lg">{complaint.branchId.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              complaint.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
              complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {complaint.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="font-medium">{complaint.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            <p className="font-medium capitalize">{complaint.priority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted By</p>
            <p className="font-medium">{complaint.submittedBy.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">{new Date(complaint.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Subject</p>
          <p className="font-bold text-lg">{complaint.subject}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Original Complaint</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">{complaint.description}</p>
          </div>
        </div>

        {complaint.response && (
          <div className="mb-6 pb-6 border-b">
            <p className="text-sm text-gray-600 mb-2">Your Initial Response</p>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-800">{complaint.response}</p>
              <p className="text-xs text-gray-500 mt-2">
                Responded by {complaint.respondedBy?.name} on {new Date(complaint.respondedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Conversation Thread */}
        {complaint.conversation && complaint.conversation.length > 0 && (
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold mb-4">Conversation History</h3>
            <div className="space-y-4">
              {complaint.conversation.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    msg.sender.role === 'branch_manager'
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-green-50 border-l-4 border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">
                      {msg.sender.name} ({msg.sender.role.replace('_', ' ')})
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <ComplaintResponseForm complaintId={complaint._id.toString()} currentStatus={complaint.status} />
      </div>
    </div>
  );
}