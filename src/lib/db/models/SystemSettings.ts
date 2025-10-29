import { Schema, model, models } from 'mongoose';

const SystemSettingsSchema = new Schema({
  settingKey: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  settingValue: Schema.Types.Mixed,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.SystemSettings || model('SystemSettings', SystemSettingsSchema);