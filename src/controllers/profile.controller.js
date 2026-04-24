/**
 * @fileoverview HTTP handlers for the Profile module (employee side).
 * Employees can view and update their personal HR record and upload a profile photo.
 *
 * Photo uploads are handled by multer middleware configured on the route.
 * Uploaded files are stored under uploads/photos/ and the path is saved in the HR record.
 *
 * @module controllers/profile.controller
 */

const ProfileService = require('../services/profile.service');

/**
 * GET /profile
 * Returns the combined account and HR record for the logged-in employee.
 * Returns 404 if the user row does not exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getProfile = async (req, res, next) => {
  try {
    const data = await ProfileService.getProfile(req.user.id);
    if (!data) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /profile
 * Updates allowed personal fields in the employee's HR record.
 * The allowed field list is enforced in the model — sensitive fields cannot be updated.
 * Returns 400 if no valid fields are provided or the record is not found.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const updateProfile = async (req, res, next) => {
  try {
    const result = await ProfileService.updateProfile(req.user.id, req.body);
    const status = result.success ? 200 : 400;
    res.status(status).json({ success: result.success, message: result.message });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /profile/photo
 * Uploads a new profile photo for the logged-in employee.
 * Expects a multipart/form-data request with the photo in the 'photo' field.
 * Returns 400 if no file is present in the request.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    // Store without the 'admin/' prefix to match the PHP convention in the DB
    const photoPath = `employeephoto/${req.file.filename}`;
    const result = await ProfileService.updatePhoto(req.user.id, photoPath);
    res.json({ success: result.success, message: result.message, data: { path: photoPath } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadPhoto };
