import connectDB from '@/lib/db/mongodb';
import Notification from '@/lib/db/models/Notification';

export async function createNotification(data: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}) {
  await connectDB();
  
  return await Notification.create({
    recipientId: data.recipientId,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedEntityType: data.relatedEntityType,
    relatedEntityId: data.relatedEntityId,
    isRead: false
  });
}

export async function getUserNotifications(userId: string) {
  await connectDB();
  
  return await Notification.find({ recipientId: userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
}

export async function markAsRead(notificationId: string) {
  await connectDB();
  
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
}

export async function getUnreadCount(userId: string) {
  await connectDB();
  
  return await Notification.countDocuments({ 
    recipientId: userId, 
    isRead: false 
  });
}