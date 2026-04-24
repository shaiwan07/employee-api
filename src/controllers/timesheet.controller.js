/**
 * @fileoverview HTTP handlers for the Timesheets module (employee side).
 * Employees can submit timesheets, save drafts, and view their own history.
 * Admin-level users can view all timesheets and approve or reject them.
 *
 * @module controllers/timesheet.controller
 */

const TimesheetService = require('../services/timesheet.service');

/**
 * GET /timesheets/mine
 * Returns a paginated list of timesheets for the logged-in employee.
 * Supports ?status filter (Draft, Submitted, Approved, Rejected).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getMyTimesheets = async (req, res, next) => {
  try {
    const data = await TimesheetService.getMyTimesheets(req.user, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /timesheets
 * Returns a paginated list of all timesheets (admin view).
 * Supports ?status and ?ltrafficid filters.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAllTimesheets = async (req, res, next) => {
  try {
    const data = await TimesheetService.getAllTimesheets(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /timesheets/:id
 * Returns a single timesheet by ID.
 * Returns 404 if the timesheet does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getTimesheetById = async (req, res, next) => {
  try {
    const data = await TimesheetService.getTimesheetById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Timesheet not found.' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /timesheets/submit
 * Creates a new timesheet with status 'Submitted'.
 * ltrafficid and name are taken from the JWT — the employee cannot spoof these.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const submitTimesheet = async (req, res, next) => {
  try {
    const result = await TimesheetService.submitTimesheet(req.user, req.body);
    res.status(201).json({ success: true, message: result.message, data: { id: result.id } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /timesheets/draft
 * Creates a new timesheet with status 'Draft'.
 * Drafts are saved but not yet sent for admin review.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const saveDraft = async (req, res, next) => {
  try {
    const result = await TimesheetService.saveDraftTimesheet(req.user, req.body);
    res.status(201).json({ success: true, message: result.message, data: { id: result.id } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /timesheets/:id/approve
 * Sets a timesheet's status to 'Approved'. Admin use only.
 * Returns 404 if the timesheet does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const approveTimesheet = async (req, res, next) => {
  try {
    const result = await TimesheetService.approveTimesheet(req.params.id);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /timesheets/:id/reject
 * Sets a timesheet's status to 'Rejected'. Admin use only.
 * Returns 404 if the timesheet does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const rejectTimesheet = async (req, res, next) => {
  try {
    const result = await TimesheetService.rejectTimesheet(req.params.id);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyTimesheets, getAllTimesheets, getTimesheetById,
  submitTimesheet, saveDraft, approveTimesheet, rejectTimesheet,
};
