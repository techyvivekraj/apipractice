import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import pool from '../config/db.js';
import jwtConfig from '../config/jwt.js';

class AuthController {
  static async register(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const { name, email,mobile, password, organizationName } = req.body;

      // Check if organization exists (only if mobile is provided)
      if (mobile) {
        const existingOrg = await Organization.findByMobile(mobile);
        if (existingOrg) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            statusCode: 409,
            errors: [{
              type: 'conflict',
              msg: 'Organization already exists with this mobile.',
              path: 'email',
              location: 'body'
            }]
          });
        }
      }

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: 'User already exists with this email.',
            path: 'email',
            location: 'body'
          }]
        });
      }

      // Create organization with optional mobile
      const organizationId = await Organization.create({
        name: organizationName,
        mobile: mobile || null // Handle null case
      });

      // Create admin user
      const userId = await User.create({
        name,
        email,
        password,
        organizationId,
        role: 'admin'
      });

      await connection.commit();

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Registration successful',
        data: {
          name,
          email,
          organizationName,
          mobile
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'An error occurred during registration',
          path: 'server',
          location: 'internal'
        }]
      });
    } finally {
      connection.release();
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'auth',
            msg: 'User not found',
            path: 'email',
            location: 'body'
          }]
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          errors: [{
            type: 'auth',
            msg: 'Account is inactive',
            path: 'status',
            location: 'body'
          }]
        });
      }

      // Validate password
      const validPassword = await User.validatePassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          errors: [{
            type: 'auth',
            msg: 'Invalid credentials',
            path: 'password',
            location: 'body'
          }]
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          organizationId: user.organization_id,
          role: user.role
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // Remove sensitive data
      delete user.password_hash;

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Login successful',
        data: {
          user,
          token,
          expiresIn: jwtConfig.expiresIn
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'An error occurred during login',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }
}

export default AuthController;