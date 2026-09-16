import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  purpose: { type: String, required: true, enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'] },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  usedAt: { type: Date }
}, { timestamps: true });

// Optional: TTL index to automatically remove expired OTPs after a while
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 }); 

const OTP = mongoose.model('OTP', otpSchema);

export { OTP };
