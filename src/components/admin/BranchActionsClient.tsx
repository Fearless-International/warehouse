'use client';

import { useState } from 'react';

interface Branch {
  _id: string;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
  managerId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface BranchActionsClientProps {
  initialBranches: Branch[];
}

export default function BranchActionsClient({ initialBranches }: BranchActionsClientProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    code: ''
  });

  const handleDelete = async (branchId: string, branchName: string) => {
    if (!confirm(`Are you sure you want to delete branch "${branchName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/branches/${branchId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Branch deleted successfully!');
        setBranches(branches.filter(b => b._id !== branchId));
      } else {
        alert(data.error || 'Failed to delete branch');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('An error occurred while deleting the branch');
    }
  };

  const startEdit = (branch: Branch) => {
    setEditingBranch(branch._id);
    setEditForm({
      name: branch.name,
      location: branch.location,
      code: branch.code
    });
  };

  const cancelEdit = () => {
    setEditingBranch(null);
    setEditForm({ name: '', location: '', code: '' });
  };

  const handleUpdate = async (branchId: string) => {
    try {
      const res = await fetch(`/api/admin/branches/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Branch updated successfully!');
        setBranches(branches.map(b => 
          b._id === branchId 
            ? { ...b, name: editForm.name, location: editForm.location, code: editForm.code }
            : b
        ));
        cancelEdit();
      } else {
        alert(data.error || 'Failed to update branch');
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      alert('An error occurred while updating the branch');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {branches.map((branch) => (
        <div key={branch._id} className="bg-white rounded-lg shadow p-6">
          {editingBranch === branch._id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Code
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleUpdate(branch._id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{branch.name}</h3>
                  <p className="text-sm text-gray-600">{branch.code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  branch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{branch.location}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium">{branch.managerId?.name || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => startEdit(branch)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(branch._id, branch.name)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}