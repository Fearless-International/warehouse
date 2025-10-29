import { Schema, model, models } from 'mongoose';

const AnomalyQuerySchema = new Schema({
  requestId: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  queriedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  anomalyDetails: [{
    product: { type: String },
    currentQuantity: { type: Number },
    averageQuantity: { type: Number },
    deviation: { type: Number },
    type: { type: String }
  }],
  queryMessage: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'responded', 'resolved'],
    default: 'pending'
  },
  branchResponse: String,
  respondedAt: Date,
  resolvedAt: Date
}, { timestamps: true });

// TTL index - auto-delete answered queries after 30 days
AnomalyQuerySchema.index(
  { respondedAt: 1 }, 
  { 
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { 
      status: { $in: ['responded', 'resolved'] }
    }
  }
);

export default models.AnomalyQuery || model('AnomalyQuery', AnomalyQuerySchema);