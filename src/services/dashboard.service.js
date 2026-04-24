/**
 * @fileoverview Dashboard service for the LTraffic Employee API.
 * Aggregates personalised statistics and recent timesheet data
 * for the employee's home screen in a single call.
 *
 * All count queries run in parallel via Promise.all() to minimise response time.
 *
 * @module services/dashboard.service
 */

const TimesheetModel = require('../models/timesheet.model');
const BulletinModel = require('../models/bulletin.model');
const VehicleModel = require('../models/vehicle.model');
const IncidentModel = require('../models/incident.model');

/**
 * Builds the dashboard data object for a logged-in employee.
 *
 * Returned shape:
 * {
 *   stats: {
 *     pending_timesheets:  number  (Draft status)
 *     submitted_timesheets:number  (Submitted status)
 *     unread_bulletins:    number  (bulletins not yet acknowledged)
 *     vehicle_checks:      number  (total submitted by this driver)
 *   }
 *   incidents_summary: Array<{ type, count }>
 *   recent_timesheets:  last 3 timesheets for this employee
 * }
 *
 * @param {object} user - Decoded JWT payload (id, ltrafficid, name, level).
 * @returns {Promise<object>}
 */
const getDashboard = async (user) => {
  const { ltrafficid, name, id: userId } = user;

  // Run all count queries simultaneously — they are independent of each other
  const [
    pendingTimesheets,
    submittedTimesheets,
    unreadBulletins,
    vehicleCheckCount,
    incidentCounts,
  ] = await Promise.all([
    TimesheetModel.countByUser(ltrafficid, 'Draft'),
    TimesheetModel.countByUser(ltrafficid, 'Submitted'),
    BulletinModel.getUnreadCount(userId),
    VehicleModel.countByDriver(name),
    IncidentModel.countByType(),
  ]);

  // Fetch the 3 most recent timesheets separately (not a simple count)
  const recentTimesheets = await TimesheetModel.findAllByUser(ltrafficid, { page: 1, limit: 3 });

  return {
    stats: {
      pending_timesheets: parseInt(pendingTimesheets),
      submitted_timesheets: parseInt(submittedTimesheets),
      unread_bulletins: parseInt(unreadBulletins),
      vehicle_checks: parseInt(vehicleCheckCount),
    },
    incidents_summary: incidentCounts,
    recent_timesheets: recentTimesheets,
  };
};

module.exports = { getDashboard };
