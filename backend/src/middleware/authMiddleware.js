import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'roadproof_jwt_super_secure_secret_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'User belonging to token no longer exists' });
      }

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
