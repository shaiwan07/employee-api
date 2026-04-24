/**
 * @fileoverview HTTP handlers for the Document Control module (employee side).
 * Employees have read-only access to three document libraries.
 * All endpoints support an optional ?search= query parameter.
 *
 * @module controllers/document.controller
 */

const DocumentService = require('../services/document.service');

/**
 * GET /documents/method-statements
 * Returns all method statement documents, optionally filtered by reference or title.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getMethodStatements = async (req, res, next) => {
  try {
    const data = await DocumentService.getMethodStatements(req.query.search);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /documents/policies
 * Returns all policy documents, optionally filtered by reference or title.
 * Each policy may include an external download link.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getPolicies = async (req, res, next) => {
  try {
    const data = await DocumentService.getPolicies(req.query.search);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /documents/coshh
 * Returns all COSHH documents, optionally filtered by reference or description.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getCoshh = async (req, res, next) => {
  try {
    const data = await DocumentService.getCoshh(req.query.search);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMethodStatements, getPolicies, getCoshh };
