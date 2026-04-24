/**
 * @fileoverview Data-access layer for the vehicle table (employee side).
 * Employees submit pre-use vehicle safety checks. All 30 check items
 * are stored as individual columns (tires, lights, windows, etc.).
 *
 * @module models/vehicle.model
 */

const db = require('../config/db');

/**
 * Returns a paginated list of all vehicle checks with optional filters.
 * Used by admin-level views.
 *
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.search] - Partial match on drivername or vehiclereg.
 * @param {string} [options.drivername] - Exact match on drivername.
 * @returns {Promise<object[]>}
 */
const findAll = async ({ page = 1, limit = 20, search, drivername } = {}) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM vehicle WHERE 1=1';
  const params = [];

  if (drivername) { query += ' AND drivername LIKE ?'; params.push(`%${drivername}%`); }
  if (search) { query += ' AND (drivername LIKE ? OR vehiclereg LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await db.query(query, params);
  return rows;
};

/**
 * Finds a single vehicle check by its primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM vehicle WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

/**
 * Returns a paginated list of vehicle checks for a specific driver.
 * Used so employees can view their own submission history.
 *
 * @param {string} drivername - Driver's full name (exact match).
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @returns {Promise<object[]>}
 */
const findByDriver = async (drivername, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    'SELECT * FROM vehicle WHERE drivername = ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [drivername, parseInt(limit), parseInt(offset)]
  );
  return rows;
};

/**
 * Creates a new vehicle check submission.
 * All 30 inspection items (tires, lights, etc.) are stored individually.
 * confirmed defaults to 0 (unconfirmed by admin).
 *
 * @param {object} data - Vehicle check fields from the employee form.
 * @returns {Promise<number>} New record ID.
 */
const create = async (data) => {
  const {
    drivername, vehiclereg, mileage, inspection_date = null, arrival_datetime,
    routeplanned, roadconditions, dressedforweather, emergencyequip,
    tires, lights, windows, loads, washer, oil, fluid, belts,
    seatbelt, horn, mirrors, brakes,
    trailercoupling = '', safetyconnection = '', loadsecured = '', loadweight = '',
    vehiclecondition, safe, report = '', notes = '', confirmed = 0,
  } = data;

  const [result] = await db.query(
    `INSERT INTO vehicle
      (drivername, vehiclereg, mileage, inspection_date, arrival_datetime,
       routeplanned, roadconditions, dressedforweather, emergencyequip,
       tires, lights, windows, loads, washer, oil, fluid, belts,
       seatbelt, horn, mirrors, brakes,
       trailercoupling, safetyconnection, loadsecured, loadweight,
       vehiclecondition, safe, report, notes, confirmed)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      drivername, vehiclereg, mileage, inspection_date, arrival_datetime || new Date(),
      routeplanned, roadconditions, dressedforweather, emergencyequip,
      tires, lights, windows, loads, washer, oil, fluid, belts,
      seatbelt, horn, mirrors, brakes,
      trailercoupling, safetyconnection, loadsecured, loadweight,
      vehiclecondition, safe, report, notes, confirmed ? 1 : 0,
    ]
  );
  return result.insertId;
};

/**
 * Counts the total number of vehicle checks submitted by a driver.
 * Used on the employee dashboard stats.
 *
 * @param {string} drivername
 * @returns {Promise<number>}
 */
const countByDriver = async (drivername) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM vehicle WHERE drivername = ?',
    [drivername]
  );
  return rows[0].count;
};

module.exports = { findAll, findById, findByDriver, create, countByDriver };
