import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  relatedEntityType: String,
  relatedEntityId: Schema.Types.ObjectId,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default models.Message || model('Message', MessageSchema);