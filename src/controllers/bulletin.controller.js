/**
 * @fileoverview HTTP handlers for the Bulletins module (employee side).
 * Employees can view bulletins and acknowledge (mark as read) them.
 * Each response includes is_read to indicate whether this user has already read it.
 *
 * @module controllers/bulletin.controller
 */

const BulletinService = require('../services/bulletin.service');

/**
 * GET /bulletins
 * Returns a paginated list of bulletins enriched with is_read for the current user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getBulletins = async (req, res, next) => {
  try {
    const data = await BulletinService.getBulletins(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bulletins/:id
 * Returns a single bulletin with is_read for the current user.
 * Returns 404 if the bulletin does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getBulletinById = async (req, res, next) => {
  try {
    const data = await BulletinService.getBulletinById(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ success: false, message: 'Bulletin not found.' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /bulletins/:id/acknowledge
 * Records the current user's acknowledgement of a bulletin.
 * Writes to both bulletinread (marks it read) and bulletinconfirm (audit trail).
 * Returns 404 if the bulletin does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const acknowledgeBulletin = async (req, res, next) => {
  try {
    const result = await BulletinService.acknowledgeBulletin(req.params.id, req.user);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getBulletins, getBulletinById, acknowledgeBulletin };
