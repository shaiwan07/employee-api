const router = require('express').Router();
const DocumentController = require('../controllers/document.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: LTraffic company documents (Method Statements, Policies, CoSHH)
 */

/**
 * @swagger
 * /documents/method-statements:
 *   get:
 *     tags: [Documents]
 *     summary: Get all method statement documents
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by reference or title
 *     responses:
 *       200:
 *         description: List of method statements
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
 *                       reference: { type: string, example: "LTMS001" }
 *                       title: { type: string }
 *                       version: { type: string }
 */
router.get('/method-statements', authenticate, DocumentController.getMethodStatements);

/**
 * @swagger
 * /documents/policies:
 *   get:
 *     tags: [Documents]
 *     summary: Get all company policy documents
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of policies
 */
router.get('/policies', authenticate, DocumentController.getPolicies);

/**
 * @swagger
 * /documents/coshh:
 *   get:
 *     tags: [Documents]
 *     summary: Get all CoSHH (Control of Substances Hazardous to Health) documents
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of CoSHH documents
 */
router.get('/coshh', authenticate, DocumentController.getCoshh);

module.exports = router;
