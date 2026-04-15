/**
 * Authentication Service
 * Handles business logic for authentication operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { JWT, USER_ROLES, ACCOUNT_STATUS } = require('../utils/constants');

class AuthService {
  /**
   * Register a new user
   */
  async register({ email, password, first_name, last_name, role = USER_ROLES.STUDENT }) {
    const transaction = await sequelize.transaction();

    try {
      // Check if user already exists
      const [existingUser] = await sequelize.query(
        'SELECT id FROM users WHERE email = ?',
        {
          replacements: [email],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (existingUser) {
        await transaction.rollback();
        throw { statusCode: 409, message: 'Email already registered' };
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Create user
      const [results] = await sequelize.query(
        `INSERT INTO users (email, password_hash, role, account_status, is_verified)
         VALUES (?, ?, ?, ?, ?)
         RETURNING id as user_id, email, role, account_status, created_at`,
        {
          replacements: [email, password_hash, role, ACCOUNT_STATUS.ACTIVE, false],
          transaction,
        }
      );

      const newUser = results[0];

      // Create user details (with minimal required fields)
      await sequelize.query(
        `INSERT INTO user_details (user_id, first_name, last_name, date_of_birth, phone)
         VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [newUser.user_id, first_name, last_name, '2000-01-01', '0000000000'],
          transaction,
        }
      );

      await transaction.commit();

      // Generate tokens
      const tokens = this.generateTokens({
        user_id: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          role: newUser.role,
          first_name,
          last_name,
        },
        ...tokens,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Get user with password hash
<<<<<<< HEAD
    const users = await sequelize.query(
=======
    const [users] = await sequelize.query(
>>>>>>> 531c062 (popi's changes)
      `SELECT u.id as user_id, u.email, u.password_hash, u.role, u.account_status,
              ud.first_name, ud.last_name
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.email = ?`,
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Check account status
    if (user.account_status !== ACCOUNT_STATUS.ACTIVE) {
      throw {
        statusCode: 403,
        message: `Account is ${user.account_status}. Please contact support.`,
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // Generate tokens
    const tokens = this.generateTokens({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      ...tokens,
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
<<<<<<< HEAD
    const users = await sequelize.query(
=======
    const [users] = await sequelize.query(
>>>>>>> 531c062 (popi's changes)
      `SELECT u.id as user_id, u.email, u.role, u.account_status, u.is_verified as email_verified, u.created_at,
              ud.first_name, ud.last_name, ud.date_of_birth, ud.phone, ud.id_number, ud.nationality, ud.gender
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const user = users[0];

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: JWT.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      expiresIn: JWT.REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT.ACCESS_TOKEN_EXPIRY,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      // Generate new tokens
      const tokens = this.generateTokens({
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
      });

      return tokens;
    } catch (error) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }
  }
}

module.exports = new AuthService();
