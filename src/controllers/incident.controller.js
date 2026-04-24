/**
 * @fileoverview HTTP handlers for the Incidents module (employee side).
 * Employees can report incidents (with an optional image upload) and view history.
 * Admin-level users can view all incidents and update their status.
 *
 * Image uploads are handled by multer middleware configured on the route.
 * The uploaded filename is stored as uploads/incidents/<filename> relative to the server root.
 *
 * @module controllers/incident.controller
 */

const IncidentService = require('../services/incident.service');

/**
 * GET /incidents
 * Returns a paginated list of all incidents (admin view).
 * Supports ?type, ?status, and ?search query filters.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAllIncidents = async (req, res, next) => {
  try {
    const data = await IncidentService.getAllIncidents(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /incidents/mine
 * Returns a paginated list of incidents reported by the logged-in employee.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getMyIncidents = async (req, res, next) => {
  try {
    const data = await IncidentService.getMyIncidents(req.user, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /incidents/:id
 * Returns a single incident by ID with an absolute image_url.
 * Returns 404 if the incident does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getIncidentById = async (req, res, next) => {
  try {
    const data = await IncidentService.getIncidentById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Incident not found.' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /incidents
 * Reports a new incident on behalf of the logged-in employee.
 * Accepts multipart/form-data — the optional image is stored under uploads/incidents/.
 * operativesname and reportedby are set from the JWT and cannot be spoofed.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const reportIncident = async (req, res, next) => {
  try {
    // PHP stores the full relative path from the employeesarea root: admin/hsupload/filename.jpg
    // We store the same format so existing PHP-uploaded images are also resolved correctly.
    const imagePath = req.file ? `admin/hsupload/${req.file.filename}` : null;
    const result = await IncidentService.reportIncident(req.user, req.body, imagePath);
    res.status(201).json({ success: true, message: result.message, data: { id: result.id } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /incidents/:id/status
 * Updates the status and optional resolution notes of an incident. Admin use only.
 * Returns 404 if the incident does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const result = await IncidentService.updateIncidentStatus(req.params.id, status, notes);
    const code = result.success ? 200 : 404;
    res.status(code).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllIncidents, getMyIncidents, getIncidentById, reportIncident, updateStatus };
