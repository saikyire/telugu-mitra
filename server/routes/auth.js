import express from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check against environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    if (username === adminUsername && password === adminPassword) {
      // Authenticate successfully
      const adminId = 'admin_user_id';
      generateTokenAndSetCookie(res, adminId);
      
      res.json({ user: { _id: adminId, name: 'Admin', username: adminUsername } });
    } else {
      // Invalid credentials
      res.status(401).json({ error: 'Invalid username or password. Please check your credentials and try again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', { maxAge: 0, httpOnly: true });
  res.json({ message: 'Logged out successfully.' });
});

// Get Current User (ME)
router.get('/me', requireAuth, (req, res) => {
  // Since there is only one admin, if the token is valid, we just return the admin details
  res.json({ user: { _id: 'admin_user_id', name: 'Admin', username: process.env.ADMIN_USERNAME } });
});

export default router;
