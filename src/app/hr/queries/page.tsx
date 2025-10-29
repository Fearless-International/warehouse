import { redirect } from 'next/navigation';

export default function HRQueriesPage() {
  // HR uses same queries page as warehouse
  redirect('/warehouse/queries');
}