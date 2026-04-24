/**
 * @fileoverview Business logic for the Profile module (employee side).
 * Combines login account data (login_users) with the HR record (employees)
 * for the currently authenticated employee.
 *
 * Employees may update a restricted set of personal fields and upload
 * a profile photo. The photo path is stored in the HR record.
 *
 * @module services/profile.service
 */

const ProfileModel = require('../models/profile.model');
const UserModel = require('../models/user.model');
const { fullUrl } = require('../utils/url.helper');

/**
 * Returns the full profile for the logged-in employee.
 * Combines account fields from login_users with HR fields from employees,
 * and resolves the photo to an absolute URL.
 *
 * Returned shape:
 * {
 *   account: { id, username, name, email, ltrafficid, team, vehiclereg,
 *               teamup, level, level_name, photo_url }
 *   hr: object | null   (null if no matching HR record exists)
 * }
 *
 * @param {number} userId - Logged-in user's ID (from JWT).
 * @returns {Promise<object|null>} null if the user row is not found.
 */
const getProfile = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) return null;

  const hr = await ProfileModel.findByUserId(userId);
  const levelName = await UserModel.getLevelName(user.level);

  return {
    account: {
      id: user.user_id,
      username: user.username,
      name: user.name,
      email: user.email,
      ltrafficid: user.ltrafficid,
      team: user.team,
      vehiclereg: user.vehiclereg,
      teamup: user.teamup,
      level: user.level,
      level_name: levelName,
      // DB column is `photoimage`; stores path relative to the admin folder
      // (e.g. employeephoto/AnthonyLouch.jpg → admin/employeephoto/AnthonyLouch.jpg on the server)
      photo_url: hr?.photoimage ? fullUrl(hr.photoimage, 'admin') : null,
    },
    hr: hr || null,
  };
};

/**
 * Updates allowed personal fields in the employee's HR record.
 * The allowed field list is enforced in ProfileModel.updateByEmployeeId —
 * only non-sensitive fields (address, emergency contact, etc.) may be changed.
 *
 * @param {number} userId - Logged-in user's ID (from JWT).
 * @param {object} data - Fields to update (filtered to allowed list in the model).
 * @returns {Promise<{success: boolean, message: string}>}
 */
const updateProfile = async (userId, data) => {
  const user = await UserModel.findById(userId);
  if (!user) return { success: false, message: 'User not found.' };

  const updated = await ProfileModel.updateByEmployeeId(user.ltrafficid, data);
  if (!updated) return { success: false, message: 'No updatable fields or record not found.' };

  return { success: true, message: 'Profile updated.' };
};

/**
 * Updates the employee's profile photo.
 * The new photo path is stored in the HR record and an absolute URL is returned.
 *
 * @param {number} userId - Logged-in user's ID (from JWT).
 * @param {string} photoPath - Relative path to the uploaded file (e.g. uploads/photos/abc.jpg).
 * @returns {Promise<{success: boolean, message: string, photo_url?: string}>}
 */
const updatePhoto = async (userId, photoPath) => {
  const user = await UserModel.findById(userId);
  if (!user) return { success: false, message: 'User not found.' };

  await ProfileModel.updatePhoto(user.ltrafficid, photoPath);
  return { success: true, message: 'Photo updated.', photo_url: fullUrl(photoPath) };
};

module.exports = { getProfile, updateProfile, updatePhoto };
