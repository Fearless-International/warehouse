import mongoose, { Schema, model, models } from 'mongoose';

const BranchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  location: String,
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default models.Branch || model('Branch', BranchSchema);