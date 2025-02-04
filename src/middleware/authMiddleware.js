import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        errors: [{
          type: 'auth',
          msg: 'No token provided',
          path: 'authorization',
          location: 'header'
        }]
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    req.user = decoded; // Adds user info to request object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      errors: [{
        type: 'auth',
        msg: 'Invalid or expired token',
        path: 'authorization',
        location: 'header'
      }]
    });
  }
};

export default authMiddleware; 