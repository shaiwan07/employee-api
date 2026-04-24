/**
 * @fileoverview Business logic for the Bulletins module (employee side).
 * Employees read bulletins and acknowledge them. Each bulletin response
 * includes is_read (whether this user has read it), image_url, and download_url.
 *
 * @module services/bulletin.service
 */

const BulletinModel = require('../models/bulletin.model');
const { fullUrl } = require('../utils/url.helper');

/**
 * Adds computed URL fields to a raw bulletin row.
 *
 * @param {object} b - Raw bulletin row from the database.
 * @returns {object} Bulletin with image_url and download_url appended.
 */
const formatBulletin = (b) => ({
  ...b,
  image_url: fullUrl(b.image, 'bulletin'),
  download_url: fullUrl(b.download),
});

/**
 * Returns a paginated list of bulletins for the employee, each decorated
 * with is_read indicating whether this user has acknowledged it.
 *
 * @param {number} userId - Logged-in user's ID (from JWT).
 * @param {object} query - Pagination options: page, limit.
 * @returns {Promise<object[]>}
 */
const getBulletins = async (userId, query) => {
  const { page = 1, limit = 20 } = query;
  const bulletins = await BulletinModel.findAll({ page, limit });

  // Enrich each bulletin with the read status for this specific user
  const enriched = await Promise.all(
    bulletins.map(async (b) => ({
      ...formatBulletin(b),
      is_read: await BulletinModel.isReadByUser(b.id, userId),
    }))
  );
  return enriched;
};

/**
 * Returns a single bulletin by ID with is_read status for the current user.
 *
 * @param {number} id - Bulletin ID.
 * @param {number} userId - Logged-in user's ID.
 * @returns {Promise<object|null>}
 */
const getBulletinById = async (id, userId) => {
  const bulletin = await BulletinModel.findById(id);
  if (!bulletin) return null;
  const formatted = formatBulletin(bulletin);
  formatted.is_read = await BulletinModel.isReadByUser(id, userId);
  return formatted;
};

/**
 * Records an employee's acknowledgement of a bulletin.
 * Inserts into bulletinread (prevents duplicate unread counts) and
 * bulletinconfirm (formal audit trail of who confirmed what).
 *
 * @param {number} id - Bulletin ID being acknowledged.
 * @param {object} user - Decoded JWT payload (id, name).
 * @returns {Promise<{success: boolean, message: string}>}
 */
const acknowledgeBulletin = async (id, user) => {
  const bulletin = await BulletinModel.findById(id);
  if (!bulletin) return { success: false, message: 'Bulletin not found.' };

  await BulletinModel.markAsRead(id, user.id);
  // Formal confirmation record — ref links back to the bulletin's reference code
  await BulletinModel.confirmBulletin(bulletin.ref, user.name, 'confirm');

  return { success: true, message: 'Bulletin acknowledged.' };
};

module.exports = { getBulletins, getBulletinById, acknowledgeBulletin };
