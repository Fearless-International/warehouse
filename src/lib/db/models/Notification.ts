import { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'request_submitted', 
      'request_approved', 
      'request_rejected', 
      'request_partial',
      'alert', 
      'complaint', 
      'message',
      'anomaly_query',
      'query_response'
    ],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntityType: String,
  relatedEntityId: Schema.Types.ObjectId,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create TTL index for auto-deletion
// Regular notifications: 24 hours
NotificationSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 86400, // 24 hours
    partialFilterExpression: { 
      type: { $nin: ['anomaly_query', 'query_response'] }
    }
  }
);

// Query notifications: kept until query is answered, then deleted after 30 days
// This is handled by the AnomalyQuery TTL index

export default models.Notification || model('Notification', NotificationSchema);