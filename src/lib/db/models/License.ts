import { Schema, model, models } from 'mongoose';

const LicenseSchema = new Schema({
  licenseKey: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  signature: { type: String, required: true },
  clientCompany: String,
  
  // License Type
  licenseType: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    required: true
  },
  
  // Limitations
  maxBranches: { type: Number, default: 5 },
  maxUsers: { type: Number, default: 10 },
  
  // Features enabled
  features: {
    anomalyDetection: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    customReports: { type: Boolean, default: false },
    querySystem: { type: Boolean, default: false },
    mobilePWA: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },
    multiWarehouse: { type: Boolean, default: false },
  },
  
  // Addons purchased
  addons: [{
    name: String,
    purchaseDate: Date,
    expiryDate: Date,
    price: Number
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'trial'],
    default: 'active'
  },
  
  issuedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  lastValidated: Date,
  
  // Installation tracking
  installationDomain: String,
  installationIP: String,
  installCount: { type: Number, default: 0 },
  maxInstallations: { type: Number, default: 1 },
  
  // Payment tracking
  purchaseId: String,
  amount: Number,
  currency: { type: String, default: 'USD' },
  
  notes: String
}, { timestamps: true });

export default models.License || model('License', LicenseSchema);