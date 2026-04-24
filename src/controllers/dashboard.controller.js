/**
 * @fileoverview HTTP handler for the Dashboard module (employee side).
 * Returns aggregated stats and recent timesheet data for the employee's home screen.
 *
 * @module controllers/dashboard.controller
 */

const DashboardService = require('../services/dashboard.service');

/**
 * GET /dashboard
 * Returns the personalised dashboard data for the logged-in employee.
 *
 * Response shape:
 * {
 *   stats: {
 *     pending_timesheets:   number,
 *     submitted_timesheets: number,
 *     unread_bulletins:     number,
 *     vehicle_checks:       number
 *   },
 *   incidents_summary: Array<{ type, count }>,
 *   recent_timesheets:  Array<timesheet> (last 3)
 * }
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getDashboard = async (req, res, next) => {
  try {
    const data = await DashboardService.getDashboard(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
