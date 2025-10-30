'use client';

import Navbar from '@/components/Navbar';
import InstallPWA from '@/components/InstallPWA';
import NetworkStatus from '@/components/NetworkStatus';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { revalidateLicense } from "@/lib/utils/revalidate";
import { useSession } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // ✅ Skip heartbeat for admin
    if (session?.user.role === 'admin') {
      return;
    }

    // ✅ Run license validation immediately
    revalidateLicense();

    // ✅ Run every 24 hours (86400000 ms)
    const revalidateInterval = setInterval(() => {
      revalidateLicense();
    }, 86400000);

    // ✅ Run heartbeat check immediately
    checkHeartbeat();

    // ✅ Run heartbeat every hour
    const heartbeatInterval = setInterval(checkHeartbeat, 60 * 60 * 1000);

    // Cleanup
    return () => {
      clearInterval(revalidateInterval);
      clearInterval(heartbeatInterval);
    };
  }, [session]);

  const checkHeartbeat = async () => {
    try {
      const res = await fetch('/api/license/heartbeat', {
        cache: 'no-store'
      });

      if (!res.ok) {
        const data = await res.json();
        
        if (data.action === 'redirect_to_activate') {
          alert(`🔒 License Issue: ${data.reason}\n\nPlease reactivate your license.`);
          router.push('/activate');
        }
      }
    } catch (error) {
      console.error('Heartbeat check failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NetworkStatus />
      <Navbar />
      <main>{children}</main>
      <InstallPWA />
    </div>
  );
}