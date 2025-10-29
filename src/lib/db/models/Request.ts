import mongoose, { Schema, model, models } from 'mongoose';
import '@/lib/db/models/Product';

const RequestSchema = new Schema({
  requestNumber: { type: String, required: true, unique: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  currentStock: Number,
  requestedQuantity: Number,
  availability: { 
    type: String, 
    enum: ['available', 'not_available', 'partially_available'],
    default: 'available'
  },
  approvedQuantity: { type: Number, default: 0 },
  itemRemarks: { type: String, default: '' },
  // NEW FIELDS
  restockDate: { type: Date }, // When item will be restocked
  canFulfillAfterRestock: { type: Boolean, default: false } // If full quantity available after restock
}],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'partially_approved'],
    default: 'pending'
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveryDate: Date,
  remarks: String,
  generalRemarks: String,
  processingTime: { 
    type: String, 
    enum: ['24_hours', '48_hours'],
    default: '24_hours'
  },
  notificationSent: { type: Boolean, default: false }
}, { timestamps: true });

export default models.Request || model('Request', RequestSchema);