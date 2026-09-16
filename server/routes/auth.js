import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { sendOTP } from '../utils/email.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate token and set cookie
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', {
    expiresIn: '7d'
  });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// 1. SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      if (user.emailVerified) {
        return res.status(400).json({ error: 'Account already exists. Please login.' });
      }
      // If user exists but not verified, update name and password and resend OTP
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
      user.name = name;
      await user.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await User.create({ name, email: normalizedEmail, passwordHash });
    }

    // Generate and send OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    
    // Clear old OTPs for this email/purpose
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'EMAIL_VERIFICATION' });
    
    await OTP.create({
      email: normalizedEmail,
      purpose: 'EMAIL_VERIFICATION',
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    const emailSent = await sendOTP(normalizedEmail, otp, 'EMAIL_VERIFICATION');
    if (!emailSent) {
      return res.status(500).json({ error: 'We couldn\'t send the verification code. Please try again.' });
    }

    res.status(201).json({ message: 'Verification code sent.', email: normalizedEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. VERIFY EMAIL OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ email: normalizedEmail, purpose: 'EMAIL_VERIFICATION' }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.usedAt) {
      return res.status(400).json({ error: 'This verification code is invalid or has expired.' });
    }
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This verification code has expired. Please request a new one.' });
    }
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    // Success! Mark used
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    const user = await User.findOne({ email: normalizedEmail });
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    generateTokenAndSetCookie(res, user._id);
    
    res.json({ message: 'Email verified successfully.', user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. RESEND OTP (Used for both verify email and forgot password)
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body; // 'EMAIL_VERIFICATION' or 'PASSWORD_RESET'
    const normalizedEmail = email.toLowerCase().trim();

    // Check cooldown
    const latestOtp = await OTP.findOne({ email: normalizedEmail, purpose }).sort({ createdAt: -1 });
    if (latestOtp && (Date.now() - latestOtp.createdAt.getTime() < 60000)) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new code.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    
    if (purpose === 'EMAIL_VERIFICATION' && user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    
    await OTP.deleteMany({ email: normalizedEmail, purpose });
    await OTP.create({
      email: normalizedEmail,
      purpose,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const emailSent = await sendOTP(normalizedEmail, otp, purpose);
    if (!emailSent) {
      return res.status(500).json({ error: 'We couldn\'t send the verification code. Please try again.' });
    }

    res.json({ message: 'Verification code sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', unverified: true });
    }

    user.lastLoginAt = new Date();
    await user.save();

    generateTokenAndSetCookie(res, user._id);
    
    res.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. FORGOT PASSWORD (Send OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if user exists or not for security, just return success
      return res.json({ message: 'If that email is registered, we have sent a reset code.' });
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'PASSWORD_RESET' });
    await OTP.create({
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOTP(normalizedEmail, otp, 'PASSWORD_RESET');
    res.json({ message: 'If that email is registered, we have sent a reset code.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 6. VERIFY PASSWORD RESET OTP (Just validation)
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ email: normalizedEmail, purpose: 'PASSWORD_RESET' }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.usedAt) {
      return res.status(400).json({ error: 'This verification code is invalid or has expired.' });
    }
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This verification code has expired. Please request a new one.' });
    }
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    // Generate a temporary reset token (valid for 15 mins) to authorize the actual password change
    const resetToken = jwt.sign({ email: normalizedEmail }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', { expiresIn: '15m' });
    
    // Mark OTP used
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    res.json({ message: 'Code verified successfully.', resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 7. RESET PASSWORD (Requires the reset token)
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
    } catch (e) {
      return res.status(400).json({ error: 'Session expired. Please request a new reset code.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Your password has been updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 8. LOGOUT
router.post('/logout', (req, res) => {
  res.cookie('token', '', { maxAge: 0, httpOnly: true });
  res.json({ message: 'Logged out successfully.' });
});

// 9. ME (Get current user)
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { _id: req.user._id, name: req.user.name, email: req.user.email } });
});

export default router;
