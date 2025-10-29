import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true, unique: true },
  category: String,
  unit: String,
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default models.Product || model('Product', ProductSchema);