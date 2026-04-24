const router = require('express').Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Employee login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address
 *                 example: al@ltraffic.co.uk
 *               password:
 *                 type: string
 *                 example: MyPassword123
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('A valid email address is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  AuthController.login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (client must discard the JWT token)
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get currently authenticated user info from token
 *     responses:
 *       200:
 *         description: Current user payload
 */
router.get('/me', authenticate, AuthController.me);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change own password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password: { type: string }
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Current password incorrect
 */
router.put(
  '/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required.'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  AuthController.changePassword
);

module.exports = router;
