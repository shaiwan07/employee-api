/**
 * @fileoverview Data-access layer for the bulletinnew table (employee side).
 * Employees read bulletins and acknowledge them. Acknowledgement is tracked
 * in two tables: bulletinread (read flag) and bulletinconfirm (formal confirmation).
 *
 * @module models/bulletin.model
 */

const db = require('../config/db');

/**
 * Returns a paginated list of all active bulletins ordered by newest first.
 *
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @returns {Promise<object[]>} Array of bulletin rows.
 */
const findAll = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    'SELECT * FROM bulletinnew ORDER BY arrival_datetime DESC LIMIT ? OFFSET ?',
    [parseInt(limit), parseInt(offset)]
  );
  return rows;
};

/**
 * Finds a single bulletin by its primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM bulletinnew WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

/**
 * Checks whether a specific user has read a bulletin.
 * Both IDs are cast to strings because bulletinread stores them as VARCHAR.
 *
 * @param {number} bulletinId
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
const isReadByUser = async (bulletinId, userId) => {
  const [rows] = await db.query(
    'SELECT id FROM bulletinread WHERE bulletin = ? AND user_id = ? LIMIT 1',
    [String(bulletinId), String(userId)]
  );
  return rows.length > 0;
};

/**
 * Marks a bulletin as read by a user. Does nothing if already read (idempotent).
 *
 * @param {number} bulletinId
 * @param {number} userId
 * @returns {Promise<boolean>} True if a new row was inserted, false if already read.
 */
const markAsRead = async (bulletinId, userId) => {
  const alreadyRead = await isReadByUser(bulletinId, userId);
  if (alreadyRead) return false;
  await db.query(
    'INSERT INTO bulletinread (bulletin, user_id) VALUES (?, ?)',
    [String(bulletinId), String(userId)]
  );
  return true;
};

/**
 * Records a formal bulletin confirmation in the bulletinconfirm table.
 * Called when an employee taps "Acknowledge" on a bulletin.
 *
 * @param {string} ref - Bulletin reference code (e.g. LTBULLETIN17).
 * @param {string} operative - Name of the employee acknowledging the bulletin.
 * @param {string} [confirm='confirm'] - Confirmation type.
 */
const confirmBulletin = async (ref, operative, confirm = 'confirm') => {
  await db.query(
    'INSERT INTO bulletinconfirm (ref, operative, confirm) VALUES (?, ?, ?)',
    [ref, operative, confirm]
  );
};

/**
 * Counts how many bulletins the user has not yet read.
 * Used on the dashboard to show an unread badge count.
 *
 * Note: fetches all bulletin IDs and all read IDs for this user in two queries,
 * then computes the difference in JavaScript. This avoids a complex LEFT JOIN
 * with VARCHAR casting on the bulletinread table.
 *
 * @param {number} userId
 * @returns {Promise<number>} Number of unread bulletins.
 */
const getUnreadCount = async (userId) => {
  const [allBulletins] = await db.query('SELECT id FROM bulletinnew');
  const [readRows] = await db.query(
    'SELECT bulletin FROM bulletinread WHERE user_id = ?',
    [String(userId)]
  );
  const readIds = new Set(readRows.map(r => r.bulletin));
  const unread = allBulletins.filter(b => !readIds.has(String(b.id)));
  return unread.length;
};

module.exports = { findAll, findById, isReadByUser, markAsRead, confirmBulletin, getUnreadCount };
