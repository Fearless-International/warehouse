'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const previousCountRef = useRef(0);
  const hasShownInitialToasts = useRef(false);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchNotifications = async (isInitialLoad = false) => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) return;
      
      const data = await response.json();
      
      const newUnreadCount = data.unreadCount;
      
      // Show toast for new notifications that arrived while user is active
      if (!isInitialLoad && newUnreadCount > previousCountRef.current) {
        const newNotifications = data.notifications.filter((n: any) => !n.isRead);
        if (newNotifications.length > 0) {
          const latest = newNotifications[0];
          toast.success(latest.title, {
            duration: 5000,
            icon: '🔔',
          });
        }
      }
      
      // On initial load, show toasts for very recent unread notifications (last 30 seconds)
      if (isInitialLoad && !hasShownInitialToasts.current && newUnreadCount > 0) {
        hasShownInitialToasts.current = true;
        const recentNotifications = data.notifications.filter((n: any) => {
          if (n.isRead) return false;
          const notifTime = new Date(n.createdAt).getTime();
          const now = Date.now();
          const thirtySecondsAgo = now - (30 * 1000);
          return notifTime > thirtySecondsAgo;
        });
        
        recentNotifications.forEach((notif: any) => {
          toast.success(notif.title, {
            duration: 5000,
            icon: '🔔',
          });
        });
      }
      
      previousCountRef.current = newUnreadCount;
      setNotifications(data.notifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications(true);
    
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(() => fetchNotifications(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    try {
      await fetch(`/api/notifications/${notif._id}/read`, { method: 'PATCH' });
      fetchNotifications();
      setShowDropdown(false);

      // Navigate based on notification type and user role
      if (notif.relatedEntityType === 'request' && notif.relatedEntityId) {
        if (session?.user.role === 'branch_manager') {
          router.push(`/branch/requests/${notif.relatedEntityId}`);
        } else if (session?.user.role === 'warehouse_manager') {
          router.push(`/warehouse/requests/${notif.relatedEntityId}`);
        }
      } else if (notif.relatedEntityType === 'complaint' && notif.relatedEntityId) {
        if (session?.user.role === 'branch_manager') {
          router.push(`/branch/complaints/${notif.relatedEntityId}`);
        } else if (['warehouse_manager', 'admin', 'hr'].includes(session?.user.role)) {
          router.push(`/warehouse/complaints/${notif.relatedEntityId}`);
        }
      } else if (notif.relatedEntityType === 'anomaly_query' && notif.relatedEntityId) {
        if (session?.user.role === 'branch_manager') {
          router.push(`/branch/queries/${notif.relatedEntityId}`);
        } else if (['warehouse_manager', 'admin', 'hr'].includes(session?.user.role)) {
          router.push(`/warehouse/queries/${notif.relatedEntityId}`);
        }
      }
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PATCH' });
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${notifId}`, { method: 'DELETE' });
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification');
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          aria-label="Notifications"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="text-xs text-gray-500 font-medium">
                          {unreadCount} unread
                        </span>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all read
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif: any) => (
                      <div
                        key={notif._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition relative group ${
                          !notif.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm line-clamp-1">{notif.title}</p>
                              {!notif.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notif._id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                            aria-label="Delete notification"
                          >
                            <X size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-gray-50 text-center">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to notifications page if you have one
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}