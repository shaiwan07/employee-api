const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ProfileController = require('../controllers/profile.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// PHP stores employee photos in admin/employeephoto/ (relative to employeesarea root).
// The DB stores the path without the 'admin/' prefix: employeephoto/filename.jpg
const photoDir = path.join(process.env.UPLOADS_ROOT || './dev-files', 'admin', 'employeephoto');
if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only JPG/PNG images allowed.'));
  },
});

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Employee profile management
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get the logged-in employee's full profile (account + HR record)
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: Profile not found
 */
router.get('/', authenticate, ProfileController.getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update contact details (telephone, address, emergency contacts)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telephone: { type: string }
 *               email: { type: string }
 *               address: { type: string }
 *               contactname1: { type: string }
 *               contacttelephone1: { type: string }
 *               relation1: { type: string }
 *               contactname2: { type: string }
 *               contacttelephone2: { type: string }
 *               relation2: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/', authenticate, ProfileController.updateProfile);

/**
 * @swagger
 * /profile/photo:
 *   post:
 *     tags: [Profile]
 *     summary: Upload profile photo
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded
 */
router.post('/photo', authenticate, upload.single('photo'), ProfileController.uploadPhoto);

module.exports = router;
