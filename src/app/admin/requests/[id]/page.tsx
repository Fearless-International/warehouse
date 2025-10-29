import { redirect } from 'next/navigation';

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/hr/requests/${id}`);
}