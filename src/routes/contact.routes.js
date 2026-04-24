const router = require('express').Router();
const ContactController = require('../controllers/contact.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: LTraffic internal contact directory
 */

/**
 * @swagger
 * /contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: Get company contact directory
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, company or email
 *     responses:
 *       200:
 *         description: Contact list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       phone: { type: string }
 *                       email: { type: string }
 *                       company: { type: string }
 */
router.get('/', authenticate, ContactController.getContacts);

module.exports = router;
