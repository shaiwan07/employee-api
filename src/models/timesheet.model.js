/**
 * @fileoverview Data-access layer for the timesheet table (employee side).
 * Each timesheet covers a 7-day working week with flat columns per day:
 * date1..date7, hours1..hours7, location1..location7, activity1..activity7, contract1..contract7.
 *
 * formatTimesheet() converts the flat structure into a nested days array
 * so clients receive a clean JSON object rather than 35 numbered columns.
 *
 * @module models/timesheet.model
 */

const db = require('../config/db');

/**
 * Transforms a flat timesheet database row into a structured object
 * with a days array for the 7-day entries.
 *
 * @param {object} row - Raw timesheet row from the database.
 * @returns {object} Formatted timesheet with id, week, ltrafficid, name, comments, status, days[].
 */
const formatTimesheet = (row) => {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    days.push({
      date: row[`date${i}`],
      hours: row[`hours${i}`],
      location: row[`location${i}`],
      activity: row[`activity${i}`],
      contract: row[`contract${i}`],
    });
  }
  return {
    id: row.id,
    week: row.week,
    ltrafficid: row.ltrafficid,
    name: row.name,
    comments: row.comments,
    status: row.status,
    days,
  };
};

/**
 * Returns a paginated list of timesheets belonging to a specific employee.
 * Optionally filtered by status.
 *
 * @param {string} ltrafficid - Employee's LTraffic ID.
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.status] - Exact status match (e.g. 'Draft', 'Submitted').
 * @returns {Promise<object[]>} Array of formatted timesheets.
 */
const findAllByUser = async (ltrafficid, { page = 1, limit = 20, status } = {}) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM timesheet WHERE ltrafficid = ?';
  const params = [ltrafficid];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await db.query(query, params);
  return rows.map(formatTimesheet);
};

/**
 * Returns a paginated list of all timesheets (admin-level view).
 * Optionally filtered by status and/or ltrafficid.
 *
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.status] - Exact status match.
 * @param {string} [options.ltrafficid] - Filter to a specific employee.
 * @returns {Promise<object[]>} Array of formatted timesheets.
 */
const findAll = async ({ page = 1, limit = 20, status, ltrafficid } = {}) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM timesheet WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (ltrafficid) { query += ' AND ltrafficid = ?'; params.push(ltrafficid); }

  query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await db.query(query, params);
  return rows.map(formatTimesheet);
};

/**
 * Finds a single timesheet by its primary key and returns it formatted.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM timesheet WHERE id = ? LIMIT 1', [id]);
  return rows.length ? formatTimesheet(rows[0]) : null;
};

/**
 * Creates a new timesheet. The days array is flattened back into numbered columns
 * for storage. Missing days default to empty strings.
 *
 * @param {object} data
 * @param {string} data.week - Week commencing string (e.g. "Monday - 09/02/2026").
 * @param {string} data.ltrafficid - Employee's LTraffic ID.
 * @param {string} data.name - Employee's full name.
 * @param {object[]} [data.days=[]] - Array of up to 7 day objects.
 * @param {string} [data.comments=''] - Optional notes.
 * @param {string} [data.status='Draft'] - Initial status.
 * @returns {Promise<number>} New timesheet ID.
 */
const create = async (data) => {
  const { week, ltrafficid, name, days = [], comments = '', status = 'Draft' } = data;
  const flat = {};
  for (let i = 0; i < 7; i++) {
    const d = days[i] || {};
    flat[`date${i + 1}`] = d.date || '';
    flat[`hours${i + 1}`] = d.hours || '0';
    flat[`location${i + 1}`] = d.location || '';
    flat[`activity${i + 1}`] = d.activity || '';
    flat[`contract${i + 1}`] = d.contract || '';
  }
  const [result] = await db.query(
    `INSERT INTO timesheet
      (week, ltrafficid, name,
       date1,hours1,location1,activity1,contract1,
       date2,hours2,location2,activity2,contract2,
       date3,hours3,location3,activity3,contract3,
       date4,hours4,location4,activity4,contract4,
       date5,hours5,location5,activity5,contract5,
       date6,hours6,location6,activity6,contract6,
       date7,hours7,location7,activity7,contract7,
       comments, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      week, ltrafficid, name,
      flat.date1, flat.hours1, flat.location1, flat.activity1, flat.contract1,
      flat.date2, flat.hours2, flat.location2, flat.activity2, flat.contract2,
      flat.date3, flat.hours3, flat.location3, flat.activity3, flat.contract3,
      flat.date4, flat.hours4, flat.location4, flat.activity4, flat.contract4,
      flat.date5, flat.hours5, flat.location5, flat.activity5, flat.contract5,
      flat.date6, flat.hours6, flat.location6, flat.activity6, flat.contract6,
      flat.date7, flat.hours7, flat.location7, flat.activity7, flat.contract7,
      comments, status,
    ]
  );
  return result.insertId;
};

/**
 * Updates the status field of a timesheet (Approved / Rejected).
 *
 * @param {number} id
 * @param {string} status
 * @returns {Promise<boolean>}
 */
const updateStatus = async (id, status) => {
  const [result] = await db.query('UPDATE timesheet SET status = ? WHERE id = ?', [status, id]);
  return result.affectedRows > 0;
};

/**
 * Counts timesheets for a specific employee filtered by status.
 * Used on the dashboard to show pending/submitted timesheet counts.
 *
 * @param {string} ltrafficid
 * @param {string} status - Exact status value.
 * @returns {Promise<number>}
 */
const countByUser = async (ltrafficid, status) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM timesheet WHERE ltrafficid = ? AND status = ?',
    [ltrafficid, status]
  );
  return rows[0].count;
};

module.exports = { findAllByUser, findAll, findById, create, updateStatus, countByUser };
