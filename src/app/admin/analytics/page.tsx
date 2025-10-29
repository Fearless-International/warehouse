import { redirect } from 'next/navigation';

export default function AdminAnalyticsPage() {
  // Admin uses same analytics as HR
  redirect('/hr/analytics');
}