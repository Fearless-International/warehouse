import mongoose, { Schema, model, models } from 'mongoose';
import '@/lib/db/models/Branch';


const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'hr', 'warehouse_manager', 'branch_manager'],
    required: true 
  },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
  phone: String,
  whatsappNumber: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

export default models.User || model('User', UserSchema);