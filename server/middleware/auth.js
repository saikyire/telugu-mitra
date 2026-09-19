import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
    
    // Since there is only one admin, any valid token is the admin
    if (decoded.userId !== 'admin_user_id') {
      return res.status(401).json({ error: 'Invalid user.' });
    }

    // Attach minimal user info to request object
    req.user = { _id: 'admin_user_id', name: 'Admin', username: process.env.ADMIN_USERNAME };
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
};
