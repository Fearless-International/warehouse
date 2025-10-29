import { useEffect, useState } from 'react';

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notification count');
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return unreadCount;
}