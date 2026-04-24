/**
 * @fileoverview Authentication and authorisation middleware for the LTraffic Employee API.
 *
 * authenticate — verifies the JWT Bearer token and populates req.user.
 * authorize    — restricts a route to specific user level IDs.
 * adminOnly    — shortcut for levels 1, 4, and 7 (admin read/write access).
 *
 * Employee user levels (stored as PHP-serialised integers in login_users.user_level):
 *   1 = Admin
 *   2 = Employee (standard operative)
 *   4 = Admin1
 *   7 = Admin2
 *
 * @module middlewares/auth.middleware
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware: validates the Authorization Bearer token.
 * - Rejects requests with no token (401).
 * - Populates req.user with the decoded JWT payload on success.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Provide a specific message for expired tokens so the client can prompt re-login
    const message = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Middleware factory: restricts a route to users with specific level IDs.
 * Must be used after authenticate (relies on req.user being set).
 *
 * @param {...number} levels - Permitted user level IDs.
 * @returns {import('express').RequestHandler}
 */
const authorize = (...levels) => {
  return (req, res, next) => {
    if (!levels.includes(req.user.level)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }
    next();
  };
};

/** Restricts to admin-level users only (Admin, Admin1, Admin2). */
const adminOnly = authorize(1, 4, 7);

module.exports = { authenticate, authorize, adminOnly };
