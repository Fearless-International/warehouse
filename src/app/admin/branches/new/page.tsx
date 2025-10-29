import AddBranchForm from '@/components/AddBranchForm';

export default function NewBranchPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Branch</h1>
      <AddBranchForm />
    </div>
  );
}