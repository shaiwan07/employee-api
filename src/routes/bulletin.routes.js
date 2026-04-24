const router = require('express').Router();
const BulletinController = require('../controllers/bulletin.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Bulletins
 *   description: Safety bulletins and toolbox talks requiring employee acknowledgement
 */

/**
 * @swagger
 * /bulletins:
 *   get:
 *     tags: [Bulletins]
 *     summary: Get all bulletins with read/unread status for the logged-in user
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of bulletins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Bulletin' }
 */
router.get('/', authenticate, BulletinController.getBulletins);

/**
 * @swagger
 * /bulletins/{id}:
 *   get:
 *     tags: [Bulletins]
 *     summary: Get a single bulletin by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Bulletin detail
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, BulletinController.getBulletinById);

/**
 * @swagger
 * /bulletins/{id}/acknowledge:
 *   post:
 *     tags: [Bulletins]
 *     summary: Acknowledge/confirm a bulletin (marks as read + records confirmation)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Bulletin acknowledged
 *       404:
 *         description: Bulletin not found
 */
router.post('/:id/acknowledge', authenticate, BulletinController.acknowledgeBulletin);

module.exports = router;
