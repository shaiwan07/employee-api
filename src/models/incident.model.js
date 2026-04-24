/**
 * @fileoverview Data-access layer for the healthsafety table (employee side).
 * Employees can report incidents, view their own, and admins can view all.
 *
 * @module models/incident.model
 */

const db = require('../config/db');

/**
 * Returns a paginated list of all incidents with optional filters.
 * Used by admin-level endpoints to view all reports.
 *
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.type] - Exact match on incident type.
 * @param {string} [options.status] - Exact match on status ('Open', 'Closed').
 * @param {string} [options.search] - Partial match on operativesname, location, or report.
 * @returns {Promise<object[]>}
 */
const findAll = async ({ page = 1, limit = 20, type, status, search } = {}) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM healthsafety WHERE 1=1';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) {
    query += ' AND (operativesname LIKE ? OR location LIKE ? OR report LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await db.query(query, params);
  return rows;
};

/**
 * Finds a single incident by its primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM healthsafety WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

/**
 * Returns a paginated list of incidents reported by a specific operative.
 * Used so employees can view their own reports.
 *
 * @param {string} name - Operative's full name (matched against operativesname column).
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @returns {Promise<object[]>}
 */
const findByOperative = async (name, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    'SELECT * FROM healthsafety WHERE operativesname = ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [name, parseInt(limit), parseInt(offset)]
  );
  return rows;
};

/**
 * Creates a new incident report. arrival_datetime is set to NOW() by the database.
 * All optional witness and injury fields default to safe null/empty values.
 *
 * @param {object} data - Incident fields from the reporting form.
 * @returns {Promise<number>} New incident ID.
 */
const create = async (data) => {
  const {
    operativesname, type, location, reportedby, report,
    involved = null, anyoneinjured = 'No', whowasinjured = null, injuryreport = null,
    reportit = null, advise = null, laterdate = null, companydetails = null,
    witness = 'No', witnessname = null, witnessaddress = null, witnesscontact = null,
    otherwitness = null, notes = null, status = null, image = null, confirmed = 0,
  } = data;

  const [result] = await db.query(
    `INSERT INTO healthsafety
      (operativesname, arrival_datetime, type, location, reportedby, report,
       involved, anyoneinjured, whowasinjured, injuryreport,
       reportit, advise, laterdate, companydetails,
       witness, witnessname, witnessaddress, witnesscontact, otherwitness,
       notes, status, image, confirmed)
     VALUES (?,NOW(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      operativesname, type, location, reportedby, report,
      involved, anyoneinjured, whowasinjured, injuryreport,
      reportit, advise, laterdate, companydetails,
      witness, witnessname, witnessaddress, witnesscontact, otherwitness,
      notes, status, image, confirmed ? 1 : 0,
    ]
  );
  return result.insertId;
};

/**
 * Updates the status and optional notes of an incident.
 * Used by admins to open/close incidents and add resolution notes.
 *
 * @param {number} id
 * @param {string} status - 'Open' or 'Closed'.
 * @param {string|null} notes - Resolution or follow-up notes.
 * @returns {Promise<boolean>}
 */
const updateStatus = async (id, status, notes) => {
  const [result] = await db.query(
    'UPDATE healthsafety SET status = ?, notes = ? WHERE id = ?',
    [status, notes, id]
  );
  return result.affectedRows > 0;
};

/**
 * Returns incident counts grouped by type.
 * Used on the employee dashboard to show the incidents summary breakdown.
 *
 * @returns {Promise<Array<{type: string, count: number}>>}
 */
const countByType = async () => {
  const [rows] = await db.query(
    "SELECT type, COUNT(*) as count FROM healthsafety GROUP BY type"
  );
  return rows;
};

module.exports = { findAll, findById, findByOperative, create, updateStatus, countByType };
