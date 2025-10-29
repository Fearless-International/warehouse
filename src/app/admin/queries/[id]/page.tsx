import { redirect } from 'next/navigation';

export default async function AdminQueryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/warehouse/queries/${id}`);
}