/**
 * @fileoverview Business logic for the Vehicle Checks module (employee side).
 * Employees (drivers) submit pre/post-shift vehicle walkaround checks.
 * Admin-level users can view all checks across all drivers.
 *
 * The vehicle check table has no status or confirmed column — all submitted
 * records are treated as final. There is no approve/reject workflow.
 *
 * @module services/vehicle.service
 */

const VehicleModel = require('../models/vehicle.model');

/**
 * Returns a paginated list of all vehicle checks (admin view).
 * Supports optional keyword search on driver name or vehicle registration.
 *
 * @param {object} query - Filters: page, limit, search.
 * @returns {Promise<object[]>}
 */
const getAllChecks = async (query) => {
  const { page = 1, limit = 20, search } = query;
  return VehicleModel.findAll({ page, limit, search });
};

/**
 * Returns a paginated list of vehicle checks submitted by the logged-in driver.
 * Matches on the driver's full name stored in the JWT.
 *
 * @param {object} user - Decoded JWT payload (name field used for lookup).
 * @param {object} query - Pagination: page, limit.
 * @returns {Promise<object[]>}
 */
const getMyChecks = async (user, query) => {
  const { page = 1, limit = 20 } = query;
  return VehicleModel.findByDriver(user.name, { page, limit });
};

/**
 * Returns a single vehicle check by ID.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const getCheckById = async (id) => {
  return VehicleModel.findById(id);
};

/**
 * Creates a new vehicle check on behalf of the logged-in driver.
 * drivername is set from the JWT so the employee cannot spoof it.
 * arrival_datetime is set to the current server time at the moment of submission.
 *
 * @param {object} user - Decoded JWT payload (name used as drivername).
 * @param {object} body - Check fields (vehicle registration, 30 item responses, etc.).
 * @returns {Promise<{id: number, message: string}>}
 */
const createCheck = async (user, body) => {
  const data = {
    ...body,
    drivername: user.name,
    // Capture submission timestamp in MySQL-compatible format (YYYY-MM-DD HH:MM:SS)
    arrival_datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  const id = await VehicleModel.create(data);
  return { id, message: 'Vehicle check submitted successfully.' };
};

module.exports = { getAllChecks, getMyChecks, getCheckById, createCheck };
