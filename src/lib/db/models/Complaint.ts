import { Schema, model, models } from 'mongoose';

const ComplaintSchema = new Schema({
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['delay', 'stock_discrepancy', 'quality', 'other'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  response: String,
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  respondedAt: Date,
  conversation: [{
    message: String,
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default models.Complaint || model('Complaint', ComplaintSchema);