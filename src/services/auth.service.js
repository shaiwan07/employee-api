/**
 * @fileoverview Authentication service for the LTraffic Employee API.
 * Handles employee login, JWT generation, and password change.
 *
 * Password storage: the legacy PHP application stored passwords as plain MD5 hashes.
 * Passwords changed through the Node.js API are stored as bcrypt hashes.
 * Both formats are supported transparently via verifyPassword().
 *
 * Unlike the admin API, there is no level restriction at login —
 * any non-restricted user may log in to the employee app.
 *
 * @module services/auth.service
 */

const jwt = require('jsonwebtoken');
const md5 = require('md5');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const logger = require('../config/logger');

/**
 * Signs a JWT containing the user's core profile fields.
 * The token is valid for the duration set in JWT_EXPIRES_IN (default 8h).
 *
 * @param {object} user - User row from login_users with a parsed level field.
 * @returns {string} Signed JWT string.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      username: user.username,
      name: user.name,
      email: user.email,
      level: user.level,
      ltrafficid: user.ltrafficid,
      team: user.team,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

/**
 * Verifies a plain-text password against a stored hash.
 * Detects whether the stored value is bcrypt (starts with $2 and is long)
 * or legacy MD5 (32-char hex string), and compares accordingly.
 *
 * @param {string} plaintext - Password submitted by the user.
 * @param {string} stored - Hash stored in the database.
 * @returns {Promise<boolean>} True if the password matches.
 */
const verifyPassword = async (plaintext, stored) => {
  const isBcrypt = stored.startsWith('$2') && stored.length > 40;
  if (isBcrypt) {
    return bcrypt.compare(plaintext, stored);
  }
  // Legacy MD5 — used by accounts created in the original PHP system
  return md5(plaintext) === stored;
};

/**
 * Authenticates an employee and returns a JWT on success.
 * Accepts email or username as the login identifier.
 * Restricted users are blocked at the model layer (findByEmail/findByUsername
 * only return rows where restricted=0).
 *
 * @param {string} email - Email address or username.
 * @param {string} password - Plain-text password.
 * @returns {Promise<{success: boolean, token?: string, user?: object, message?: string}>}
 */
const login = async (email, password) => {
  // Try email first, then fall back to username
  let user = await UserModel.findByEmail(email);
  if (!user) user = await UserModel.findByUsername(email);

  if (!user) {
    logger.warn('Login failed — user not found', { email });
    return { success: false, message: 'Invalid credentials.' };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    logger.warn('Login failed — wrong password', { email });
    return { success: false, message: 'Invalid credentials.' };
  }

  logger.info('Login successful', { userId: user.user_id, email: user.email });
  const levelName = await UserModel.getLevelName(user.level);
  const token = generateToken(user);

  return {
    success: true,
    token,
    user: {
      id: user.user_id,
      username: user.username,
      name: user.name,
      email: user.email,
      level: user.level,
      level_name: levelName,
      ltrafficid: user.ltrafficid,
      team: user.team,
      vehiclereg: user.vehiclereg,
      teamup: user.teamup,
      onboarding: user.onboarding,
    },
  };
};

/**
 * Changes the password for an authenticated employee.
 * Verifies the current password before applying the change.
 * New password is stored as a bcrypt hash (cost 12).
 *
 * @param {number} userId - ID of the logged-in user (from JWT).
 * @param {string} currentPassword - Current plain-text password for verification.
 * @param {string} newPassword - New plain-text password to store.
 * @returns {Promise<{success: boolean, message: string}>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await UserModel.findById(userId);
  if (!user) return { success: false, message: 'User not found.' };

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
    logger.warn('Password change failed — wrong current password', { userId });
    return { success: false, message: 'Current password is incorrect.' };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await UserModel.updatePassword(userId, hashed);
  logger.info('Password changed', { userId });

  return { success: true, message: 'Password updated successfully.' };
};

module.exports = { login, changePassword, generateToken };
