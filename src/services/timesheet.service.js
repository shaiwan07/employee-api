/**
 * @fileoverview Business logic for the Timesheets module (employee side).
 * Employees can submit timesheets, save drafts, and view their own history.
 * Admin-level users can view all timesheets and approve or reject them.
 *
 * @module services/timesheet.service
 */

const TimesheetModel = require('../models/timesheet.model');

/**
 * Returns a paginated list of timesheets for the logged-in employee.
 * Optionally filtered by status (Draft, Submitted, Approved, Rejected).
 *
 * @param {object} user - Decoded JWT payload (ltrafficid used for lookup).
 * @param {object} query - Filters: page, limit, status.
 * @returns {Promise<object[]>}
 */
const getMyTimesheets = async (user, query) => {
  const { page = 1, limit = 20, status } = query;
  const sheets = await TimesheetModel.findAllByUser(user.ltrafficid, { page, limit, status });
  return sheets;
};

/**
 * Returns a paginated list of all timesheets (admin view).
 * Supports filtering by status and ltrafficid.
 *
 * @param {object} query - Filters: page, limit, status, ltrafficid.
 * @returns {Promise<object[]>}
 */
const getAllTimesheets = async (query) => {
  const { page = 1, limit = 20, status, ltrafficid } = query;
  return TimesheetModel.findAll({ page, limit, status, ltrafficid });
};

/**
 * Returns a single timesheet by ID.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const getTimesheetById = async (id) => {
  return TimesheetModel.findById(id);
};

/**
 * Creates a new timesheet with status 'Submitted'.
 * ltrafficid and name are taken from the JWT — the employee cannot spoof these.
 *
 * @param {object} user - Decoded JWT payload (ltrafficid, name).
 * @param {object} body - Timesheet fields: week, days (array of 7 day objects), comments.
 * @returns {Promise<{id: number, message: string}>}
 */
const submitTimesheet = async (user, body) => {
  const { week, days, comments } = body;
  const id = await TimesheetModel.create({
    week,
    ltrafficid: user.ltrafficid,
    name: user.name,
    days,
    comments,
    status: 'Submitted',
  });
  return { id, message: 'Timesheet submitted successfully.' };
};

/**
 * Creates a new timesheet with status 'Draft'.
 * Drafts are visible to the employee in their history but not yet actioned by admin.
 *
 * @param {object} user - Decoded JWT payload (ltrafficid, name).
 * @param {object} body - Timesheet fields: week, days, comments.
 * @returns {Promise<{id: number, message: string}>}
 */
const saveDraftTimesheet = async (user, body) => {
  const { week, days, comments } = body;
  const id = await TimesheetModel.create({
    week,
    ltrafficid: user.ltrafficid,
    name: user.name,
    days,
    comments,
    status: 'Draft',
  });
  return { id, message: 'Timesheet saved as draft.' };
};

/**
 * Sets a timesheet's status to 'Approved'. Admin use only.
 *
 * @param {number} id - Timesheet ID.
 * @returns {Promise<{success: boolean, message: string}>}
 */
const approveTimesheet = async (id) => {
  const sheet = await TimesheetModel.findById(id);
  if (!sheet) return { success: false, message: 'Timesheet not found.' };
  await TimesheetModel.updateStatus(id, 'Approved');
  return { success: true, message: 'Timesheet approved.' };
};

/**
 * Sets a timesheet's status to 'Rejected'. Admin use only.
 *
 * @param {number} id - Timesheet ID.
 * @returns {Promise<{success: boolean, message: string}>}
 */
const rejectTimesheet = async (id) => {
  const sheet = await TimesheetModel.findById(id);
  if (!sheet) return { success: false, message: 'Timesheet not found.' };
  await TimesheetModel.updateStatus(id, 'Rejected');
  return { success: true, message: 'Timesheet rejected.' };
};

module.exports = {
  getMyTimesheets, getAllTimesheets, getTimesheetById,
  submitTimesheet, saveDraftTimesheet, approveTimesheet, rejectTimesheet,
};
