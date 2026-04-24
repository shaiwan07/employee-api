/**
 * @fileoverview Business logic for the Incidents module (employee side).
 * Employees can report incidents and view their own history.
 * Admin-level users can view and update all incidents.
 *
 * @module services/incident.service
 */

const IncidentModel = require('../models/incident.model');
const { fullUrl } = require('../utils/url.helper');

/**
 * Appends an absolute image_url to an incident row.
 * Incident images are uploaded to the server root and served as static files.
 *
 * @param {object} row - Raw incident row from the database.
 * @returns {object} Incident with image_url appended.
 */
const addImageUrl = (row) => ({ ...row, image_url: fullUrl(row.image) });

/**
 * Returns a paginated list of all incidents (admin view).
 * Supports filtering by type, status, and keyword search.
 *
 * @param {object} query - Filters: page, limit, type, status, search.
 * @returns {Promise<object[]>}
 */
const getAllIncidents = async (query) => {
  const { page = 1, limit = 20, type, status, search } = query;
  const rows = await IncidentModel.findAll({ page, limit, type, status, search });
  return rows.map(addImageUrl);
};

/**
 * Returns a paginated list of incidents reported by the logged-in employee.
 * Matches on the operative's full name stored at the time of reporting.
 *
 * @param {object} user - Decoded JWT payload (name field used for lookup).
 * @param {object} query - Pagination: page, limit.
 * @returns {Promise<object[]>}
 */
const getMyIncidents = async (user, query) => {
  const { page = 1, limit = 20 } = query;
  const rows = await IncidentModel.findByOperative(user.name, { page, limit });
  return rows.map(addImageUrl);
};

/**
 * Returns a single incident by ID with image_url.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const getIncidentById = async (id) => {
  const row = await IncidentModel.findById(id);
  return row ? addImageUrl(row) : null;
};

/**
 * Creates a new incident report on behalf of the logged-in employee.
 * operativesname and reportedby are automatically set from the JWT user.
 *
 * @param {object} user - Decoded JWT payload (name used as operative name).
 * @param {object} body - Incident details from the request body.
 * @param {string|null} imagePath - Uploaded image filename, or null.
 * @returns {Promise<{id: number, message: string}>}
 */
const reportIncident = async (user, body, imagePath) => {
  const data = {
    operativesname: user.name,
    reportedby: user.name,
    ...body,
    image: imagePath || null,
    status: null,  // New incidents start with no status (admin sets Open/Closed)
  };
  const id = await IncidentModel.create(data);
  return { id, message: 'Incident reported successfully.' };
};

/**
 * Updates the status and resolution notes of an incident.
 * Used by admin-level users to open or close an incident.
 *
 * @param {number} id - Incident ID.
 * @param {string} status - 'Open' or 'Closed'.
 * @param {string|null} notes - Resolution notes.
 * @returns {Promise<{success: boolean, message: string}>}
 */
const updateIncidentStatus = async (id, status, notes) => {
  const incident = await IncidentModel.findById(id);
  if (!incident) return { success: false, message: 'Incident not found.' };
  await IncidentModel.updateStatus(id, status, notes);
  return { success: true, message: `Incident marked as ${status}.` };
};

module.exports = {
  getAllIncidents, getMyIncidents, getIncidentById, reportIncident, updateIncidentStatus,
};
