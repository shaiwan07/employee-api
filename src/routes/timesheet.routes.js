const router = require('express').Router();
const { body } = require('express-validator');
const TimesheetController = require('../controllers/timesheet.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Admin levels that can approve/reject timesheets
const adminLevels = [1, 4, 7];

const daySchema = body('days')
  .isArray({ min: 1, max: 7 })
  .withMessage('days must be an array of 1-7 entries.');

/**
 * @swagger
 * tags:
 *   name: Timesheets
 *   description: Weekly timesheet management
 */

/**
 * @swagger
 * /timesheets/mine:
 *   get:
 *     tags: [Timesheets]
 *     summary: Get my timesheets
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Draft, Submitted, Approved, Rejected] }
 *     responses:
 *       200:
 *         description: List of my timesheets
 */
router.get('/mine', authenticate, TimesheetController.getMyTimesheets);

/**
 * @swagger
 * /timesheets:
 *   get:
 *     tags: [Timesheets]
 *     summary: Get all timesheets (admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: ltrafficid
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: All timesheets
 */
router.get('/', authenticate, authorize(...adminLevels), TimesheetController.getAllTimesheets);

/**
 * @swagger
 * /timesheets/{id}:
 *   get:
 *     tags: [Timesheets]
 *     summary: Get timesheet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Timesheet detail
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, TimesheetController.getTimesheetById);

/**
 * @swagger
 * /timesheets/submit:
 *   post:
 *     tags: [Timesheets]
 *     summary: Submit a weekly timesheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [week, days]
 *             properties:
 *               week:
 *                 type: string
 *                 example: "Monday - 09/02/2026"
 *               comments:
 *                 type: string
 *               days:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date: { type: string }
 *                     hours: { type: string }
 *                     location: { type: string }
 *                     activity: { type: string }
 *                     contract: { type: string }
 *     responses:
 *       201:
 *         description: Timesheet submitted
 */
router.post(
  '/submit',
  authenticate,
  [body('week').notEmpty().withMessage('week is required.'), daySchema],
  validate,
  TimesheetController.submitTimesheet
);

/**
 * @swagger
 * /timesheets/draft:
 *   post:
 *     tags: [Timesheets]
 *     summary: Save a timesheet as draft
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [week, days]
 *             properties:
 *               week: { type: string }
 *               days: { type: array, items: { type: object } }
 *               comments: { type: string }
 *     responses:
 *       201:
 *         description: Draft saved
 */
router.post(
  '/draft',
  authenticate,
  [body('week').notEmpty().withMessage('week is required.'), daySchema],
  validate,
  TimesheetController.saveDraft
);

/**
 * @swagger
 * /timesheets/{id}/approve:
 *   patch:
 *     tags: [Timesheets]
 *     summary: Approve a timesheet (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Approved
 */
router.patch('/:id/approve', authenticate, authorize(...adminLevels), TimesheetController.approveTimesheet);

/**
 * @swagger
 * /timesheets/{id}/reject:
 *   patch:
 *     tags: [Timesheets]
 *     summary: Reject a timesheet (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rejected
 */
router.patch('/:id/reject', authenticate, authorize(...adminLevels), TimesheetController.rejectTimesheet);

module.exports = router;
