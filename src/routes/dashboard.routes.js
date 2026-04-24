const router = require('express').Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Employee dashboard summary
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get personalised dashboard stats for the logged-in employee
 *     description: Returns pending timesheets count, unread bulletins, vehicle check count, incident summary and recent timesheets.
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         pending_timesheets: { type: integer }
 *                         submitted_timesheets: { type: integer }
 *                         unread_bulletins: { type: integer }
 *                         vehicle_checks: { type: integer }
 *                     incidents_summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type: { type: string }
 *                           count: { type: integer }
 *                     recent_timesheets:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Timesheet' }
 */
router.get('/', authenticate, DashboardController.getDashboard);

module.exports = router;
