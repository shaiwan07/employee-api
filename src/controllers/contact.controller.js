/**
 * @fileoverview HTTP handler for the Contacts module (employee side).
 * Returns records from the address book table.
 * Employees have read-only access; there is no create/update/delete endpoint.
 *
 * The address table is a simple contact directory (name, company, email, phone).
 * No model layer is used here — the query is simple enough to sit directly
 * in the controller, and the table is not shared with any other module.
 *
 * @module controllers/contact.controller
 */

const db = require('../config/db');

/**
 * GET /contacts
 * Returns all contacts, optionally filtered by a search term across
 * name, company, and email fields.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getContacts = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM address';
    const params = [];
    if (search) {
      query += ' WHERE name LIKE ? OR company LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY name ASC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContacts };
