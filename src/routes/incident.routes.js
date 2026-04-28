const router = require('express').Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const IncidentController = require('../controllers/incident.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// PHP employee h&s form saves incident images to admin/hsupload/ (relative to employeesarea root).
// DB stores the full relative path: admin/hsupload/filename.jpg
// We save to the same directory so web-uploaded and mobile-uploaded images are identical.
const incidentDir = path.join(process.env.UPLOADS_ROOT || path.join(__dirname, '..', '..', 'dev-files'), 'admin', 'hsupload');
try { fs.mkdirSync(incidentDir, { recursive: true }); } catch (_) { /* directory may already exist or be managed by the server */ }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, incidentDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `incident_${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Accident, Incident, Near Miss and Environmental Reporting (H&S Form)
 */

/**
 * @swagger
 * /incidents/mine:
 *   get:
 *     tags: [Incidents]
 *     summary: Get my reported incidents
 *     responses:
 *       200:
 *         description: My incidents
 */
router.get('/mine', authenticate, IncidentController.getMyIncidents);

/**
 * @swagger
 * /incidents:
 *   get:
 *     tags: [Incidents]
 *     summary: Get all incidents (admin only)
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [Accident, Incident, 'Near Miss', 'Service Strike', 'Environmental'] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: All incidents
 */
router.get('/', authenticate, authorize(1, 4, 7), IncidentController.getAllIncidents);

/**
 * @swagger
 * /incidents/{id}:
 *   get:
 *     tags: [Incidents]
 *     summary: Get incident by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Incident detail
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, IncidentController.getIncidentById);

/**
 * @swagger
 * /incidents:
 *   post:
 *     tags: [Incidents]
 *     summary: Report a new incident (Accident / Incident / Near Miss / Service Strike)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [type, location, report]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Accident, Incident, 'Near Miss', 'Service Strike', Environmental]
 *               location: { type: string }
 *               report: { type: string, description: "Full description of what happened" }
 *               involved: { type: string }
 *               anyoneinjured: { type: string, enum: [Yes, No] }
 *               whowasinjured: { type: string }
 *               injuryreport: { type: string }
 *               reportit: { type: string, enum: [Yes, No] }
 *               advise: { type: string, enum: [Yes, No] }
 *               laterdate: { type: string, enum: [Yes, No] }
 *               companydetails: { type: string }
 *               witness: { type: string, enum: [Yes, No] }
 *               witnessname: { type: string }
 *               witnessaddress: { type: string }
 *               witnesscontact: { type: string }
 *               otherwitness: { type: string }
 *               confirmed:
 *                 type: boolean
 *                 description: "Operative confirms all info is true (Step 8)"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Incident reported
 */
router.post(
  '/',
  authenticate,
  upload.single('image'),
  [
    body('type')
      .isIn(['Accident', 'Incident', 'Near Miss', 'Service Strike', 'Environmental'])
      .withMessage('Invalid incident type.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('report').notEmpty().withMessage('Report description is required.'),
  ],
  validate,
  IncidentController.reportIncident
);

/**
 * @swagger
 * /incidents/{id}/status:
 *   patch:
 *     tags: [Incidents]
 *     summary: Update incident status (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Open, Closed, Pending, Reviewed] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(1, 4, 7),
  [body('status').notEmpty().withMessage('Status is required.')],
  validate,
  IncidentController.updateStatus
);

module.exports = router;
