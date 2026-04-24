/**
 * @fileoverview Data-access layer for the hr table (employee profile side).
 * Employees can read their own HR record and update limited personal fields.
 * The hr table is linked to login_users via ltrafficid = employeeid.
 *
 * @module models/profile.model
 */

const db = require('../config/db');

/**
 * Finds an HR record by the employee's LTraffic ID.
 * Used when the employeeid is already known.
 *
 * @param {string} employeeid - Employee's LTraffic ID (e.g. "00007").
 * @returns {Promise<object|null>}
 */
const findByEmployeeId = async (employeeid) => {
  const [rows] = await db.query(
    'SELECT * FROM hr WHERE employeeid = ? LIMIT 1',
    [employeeid]
  );
  return rows[0] || null;
};

/**
 * Finds an HR record by the user's login_users.user_id.
 * Joins login_users to hr via ltrafficid = employeeid.
 * Used in the profile service where only the JWT user_id is available.
 *
 * @param {number} userId - login_users.user_id from the JWT payload.
 * @returns {Promise<object|null>}
 */
const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT hr.* FROM hr
     JOIN login_users lu ON lu.ltrafficid = hr.employeeid
     WHERE lu.user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Updates allowed personal contact fields on an HR record.
 * Employees may only update their own personal contact details —
 * employment fields (jobtitle, salary, etc.) are admin-only.
 *
 * @param {string} employeeid
 * @param {object} data - Partial update payload (only allowed fields are applied).
 * @returns {Promise<boolean>} True if at least one field was updated.
 */
const updateByEmployeeId = async (employeeid, data) => {
  const allowed = [
    'telephone', 'email', 'address', 'contactname1', 'contacttelephone1', 'relation1',
    'contactname2', 'contacttelephone2', 'relation2', 'ltrafficphone', 'ltrafficemail',
  ];
  const fields = Object.keys(data).filter(k => allowed.includes(k));
  if (!fields.length) return false;

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f]);
  values.push(employeeid);

  const [result] = await db.query(
    `UPDATE hr SET ${setClause} WHERE employeeid = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Updates the employee photo path in the hr table.
 *
 * @param {string} employeeid
 * @param {string} photoPath - Relative path to the uploaded photo file.
 * @returns {Promise<boolean>}
 */
const updatePhoto = async (employeeid, photoPath) => {
  const [result] = await db.query(
    'UPDATE hr SET photoimage = ? WHERE employeeid = ?',
    [photoPath, employeeid]
  );
  return result.affectedRows > 0;
};

module.exports = { findByEmployeeId, findByUserId, updateByEmployeeId, updatePhoto };
