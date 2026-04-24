/**
 * @fileoverview HTTP handlers for the Vehicle Checks module (employee side).
 * Drivers submit pre/post-shift vehicle walkaround checks.
 * Admin-level users can view all checks across all drivers.
 *
 * @module controllers/vehicle.controller
 */

const VehicleService = require('../services/vehicle.service');

/**
 * GET /vehicle-checks
 * Returns a paginated list of all vehicle checks (admin view).
 * Supports ?search filter on driver name or vehicle registration.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAllChecks = async (req, res, next) => {
  try {
    const data = await VehicleService.getAllChecks(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /vehicle-checks/mine
 * Returns a paginated list of vehicle checks submitted by the logged-in driver.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getMyChecks = async (req, res, next) => {
  try {
    const data = await VehicleService.getMyChecks(req.user, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /vehicle-checks/:id
 * Returns a single vehicle check by ID.
 * Returns 404 if the check does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getCheckById = async (req, res, next) => {
  try {
    const data = await VehicleService.getCheckById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Vehicle check not found.' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /vehicle-checks
 * Submits a new vehicle check on behalf of the logged-in driver.
 * drivername is set from the JWT and arrival_datetime is set to the current server time.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createCheck = async (req, res, next) => {
  try {
    const result = await VehicleService.createCheck(req.user, req.body);
    res.status(201).json({ success: true, message: result.message, data: { id: result.id } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllChecks, getMyChecks, getCheckById, createCheck };
