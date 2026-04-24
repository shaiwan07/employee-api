/**
 * @fileoverview HTTP handlers for the Auth module (employee side).
 * Handles login, logout, password change, and current-user retrieval.
 *
 * @module controllers/auth.controller
 */

const AuthService = require('../services/auth.service');

/**
 * POST /auth/login
 * Authenticates an employee (email or username) and returns a JWT.
 * Returns 401 if credentials are invalid.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    if (!result.success) {
      return res.status(401).json({ success: false, message: result.message });
    }
    return res.json({
      success: true,
      message: 'Login successful.',
      data: { token: result.token, user: result.user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout
 * Stateless logout — the server has no session to destroy.
 * The client is responsible for discarding the JWT.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const logout = (req, res) => {
  // JWT is stateless; client discards the token.
  res.json({ success: true, message: 'Logged out successfully.' });
};

/**
 * POST /auth/change-password
 * Changes the password for the currently authenticated employee.
 * Requires the current password to be provided for verification.
 * Returns 400 if the current password is wrong.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const result = await AuthService.changePassword(req.user.id, current_password, new_password);
    const status = result.success ? 200 : 400;
    return res.status(status).json({ success: result.success, message: result.message });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/me
 * Returns the decoded JWT payload for the currently authenticated user.
 * Useful for the mobile app to re-hydrate session state without storing it locally.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { login, logout, changePassword, me };
