import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export { User };
