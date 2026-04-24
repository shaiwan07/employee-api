/**
 * @fileoverview Data-access layer for document control tables (employee side).
 * Employees have read-only access to three document libraries:
 *
 * 1. Method Statements — methodstatements table (ms1=reference, ms2=title, ms3=version).
 * 2. Policies          — policies table (pol1=reference, pol2=title, pol3=version, pol4=link).
 * 3. COSHH             — coshh table (cos1=reference, cos2=description, cos3=version).
 *
 * Column names use legacy short codes from the PHP system — they are remapped
 * to descriptive keys (reference, title, version, link) in the response.
 *
 * @module models/document.model
 */

const db = require('../config/db');

/**
 * Returns all method statement documents, optionally filtered by reference or title.
 *
 * @param {string} [search] - Partial match on ms1 (reference) or ms2 (title).
 * @returns {Promise<Array<{id, reference, title, version}>>}
 */
const getMethodStatements = async (search) => {
  let query = 'SELECT * FROM methodstatements';
  const params = [];
  if (search) {
    query += ' WHERE ms1 LIKE ? OR ms2 LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY id ASC';
  const [rows] = await db.query(query, params);
  return rows.map(r => ({
    id: r.id,
    reference: r.ms1,
    title: r.ms2,
    version: r.ms3,
  }));
};

/**
 * Returns all policy documents, optionally filtered by reference or title.
 * pol4 contains an external download link and may be null.
 *
 * @param {string} [search] - Partial match on pol1 (reference) or pol2 (title).
 * @returns {Promise<Array<{id, reference, title, version, link}>>}
 */
const getPolicies = async (search) => {
  let query = 'SELECT * FROM policies';
  const params = [];
  if (search) {
    query += ' WHERE pol1 LIKE ? OR pol2 LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY id ASC';
  const [rows] = await db.query(query, params);
  return rows.map(r => ({
    id: r.id,
    reference: r.pol1,
    title: r.pol2,
    version: r.pol3,
    link: r.pol4 || null,
  }));
};

/**
 * Returns all COSHH documents, optionally filtered by reference or description.
 *
 * @param {string} [search] - Partial match on cos1 (reference) or cos2 (description).
 * @returns {Promise<Array<{id, reference, title, version}>>}
 */
const getCoshh = async (search) => {
  let query = 'SELECT * FROM coshh';
  const params = [];
  if (search) {
    query += ' WHERE cos1 LIKE ? OR cos2 LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY id ASC';
  const [rows] = await db.query(query, params);
  return rows.map(r => ({
    id: r.id,
    reference: r.cos1,
    title: r.cos2,
    version: r.cos3,
  }));
};

module.exports = { getMethodStatements, getPolicies, getCoshh };
