/**
 * @fileoverview Data-access layer for the login_users table (employee side).
 *
 * Important: user_level in login_users is stored as a PHP-serialised string
 * (e.g. a:1:{i:0;s:1:"2";}) — parseUserLevel extracts the integer from it.
 *
 * Employee login queries filter by restricted=0 — restricted users cannot log in.
 * findById does NOT filter by restricted so profile lookups still work after login.
 *
 * @module models/user.model
 */

const db = require('../config/db');

/**
 * Parses a PHP-serialised user_level value into an integer.
 * The legacy PHP application stored user levels as serialised arrays.
 *
 * Example input:  'a:1:{i:0;s:1:"2";}'
 * Example output: 2
 *
 * @param {string|null} serialized - PHP-serialised string from the database.
 * @returns {number|null} Integer level, or null if parsing fails.
 */
const parseUserLevel = (serialized) => {
  if (!serialized) return null;
  const match = serialized.match(/s:\d+:"(\d+)"/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Finds a non-restricted user by email address.
 * restricted=0 check prevents locked accounts from logging in.
 *
 * @param {string} email
 * @returns {Promise<object|null>} User row with parsed level, or null if not found/restricted.
 */
const findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM login_users WHERE email = ? AND restricted = 0 LIMIT 1',
    [email]
  );
  if (!rows.length) return null;
  const user = rows[0];
  user.level = parseUserLevel(user.user_level);
  return user;
};

/**
 * Finds a non-restricted user by username.
 * Used as a fallback when login input does not match any email address.
 *
 * @param {string} username
 * @returns {Promise<object|null>} User row with parsed level, or null if not found/restricted.
 */
const findByUsername = async (username) => {
  const [rows] = await db.query(
    'SELECT * FROM login_users WHERE username = ? AND restricted = 0 LIMIT 1',
    [username]
  );
  if (!rows.length) return null;
  const user = rows[0];
  user.level = parseUserLevel(user.user_level);
  return user;
};

/**
 * Finds a user by primary key. Does not filter by restricted — used for
 * post-login operations such as profile lookup where the user is already authenticated.
 *
 * @param {number} id - login_users.user_id
 * @returns {Promise<object|null>} User row with parsed level, or null.
 */
const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM login_users WHERE user_id = ? LIMIT 1',
    [id]
  );
  if (!rows.length) return null;
  const user = rows[0];
  user.level = parseUserLevel(user.user_level);
  return user;
};

/**
 * Updates the stored password hash for a user.
 * Called after a successful change-password request.
 *
 * @param {number} userId
 * @param {string} hashedPassword - bcrypt hash of the new password.
 * @returns {Promise<boolean>}
 */
const updatePassword = async (userId, hashedPassword) => {
  const [result] = await db.query(
    'UPDATE login_users SET password = ? WHERE user_id = ?',
    [hashedPassword, userId]
  );
  return result.affectedRows > 0;
};

/**
 * Looks up the human-readable name for a user level from the login_levels table.
 *
 * @param {number} levelId
 * @returns {Promise<string>} Level name (e.g. "Employee", "Admin"), or "Unknown".
 */
const getLevelName = async (levelId) => {
  const [rows] = await db.query(
    'SELECT level_name FROM login_levels WHERE id = ? LIMIT 1',
    [levelId]
  );
  return rows.length ? rows[0].level_name : 'Unknown';
};

module.exports = { findByEmail, findByUsername, findById, updatePassword, getLevelName, parseUserLevel };
