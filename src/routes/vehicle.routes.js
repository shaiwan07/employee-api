const router = require('express').Router();
const { body } = require('express-validator');
const VehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

/**
 * @swagger
 * tags:
 *   name: Vehicle Checks
 *   description: Daily vehicle pre-trip inspection and mileage log
 */

/**
 * @swagger
 * /vehicles/mine:
 *   get:
 *     tags: [Vehicle Checks]
 *     summary: Get my vehicle checks
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: My vehicle checks list
 */
router.get('/mine', authenticate, VehicleController.getMyChecks);

/**
 * @swagger
 * /vehicles:
 *   get:
 *     tags: [Vehicle Checks]
 *     summary: Get all vehicle checks (admin only)
 *     parameters:
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
 *         description: All vehicle checks
 */
router.get('/', authenticate, authorize(1, 4, 7), VehicleController.getAllChecks);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     tags: [Vehicle Checks]
 *     summary: Get a vehicle check by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Vehicle check detail
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, VehicleController.getCheckById);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     tags: [Vehicle Checks]
 *     summary: Submit a daily vehicle pre-trip inspection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiclereg, mileage, inspection_date, routeplanned, roadconditions, dressedforweather, emergencyequip, tires, lights, windows, loads, washer, oil, fluid, belts, seatbelt, horn, mirrors, brakes, vehiclecondition, safe, confirmed]
 *             properties:
 *               vehiclereg: { type: string, example: "LT13 ANT" }
 *               mileage: { type: integer, example: 45230 }
 *               inspection_date: { type: string, format: date, example: "2024-01-15", description: "Date of inspection (Step 1)" }
 *               routeplanned: { type: string, enum: [Yes, No] }
 *               roadconditions: { type: string, enum: [Yes, No] }
 *               dressedforweather: { type: string, enum: [Yes, No] }
 *               emergencyequip: { type: string, enum: [Yes, No] }
 *               tires: { type: string, enum: [Yes, No] }
 *               lights: { type: string, enum: [Yes, No] }
 *               windows: { type: string, enum: [Yes, No] }
 *               loads: { type: string, enum: [Yes, No] }
 *               washer: { type: string, enum: [Yes, No] }
 *               oil: { type: string, enum: [Yes, No] }
 *               fluid: { type: string, enum: [Yes, No] }
 *               belts: { type: string, enum: [Yes, No] }
 *               seatbelt: { type: string, enum: [Yes, No] }
 *               horn: { type: string, enum: [Yes, No] }
 *               mirrors: { type: string, enum: [Yes, No] }
 *               brakes: { type: string, enum: [Yes, No] }
 *               trailercoupling: { type: string }
 *               safetyconnection: { type: string }
 *               loadsecured: { type: string }
 *               loadweight: { type: string }
 *               vehiclecondition: { type: string, enum: [Good, Fair, Poor] }
 *               safe: { type: string, enum: [Safe, Unsafe] }
 *               report: { type: string }
 *               notes: { type: string }
 *               confirmed: { type: boolean, description: "Driver confirms all info is true (Step 7)" }
 *     responses:
 *       201:
 *         description: Vehicle check submitted
 */
router.post(
  '/',
  authenticate,
  [
    body('vehiclereg').notEmpty().withMessage('vehiclereg is required.'),
    body('mileage').isInt({ min: 0 }).withMessage('mileage must be a positive integer.'),
    body('inspection_date').notEmpty().withMessage('inspection_date is required.'),
    body('vehiclecondition').notEmpty().withMessage('vehiclecondition is required.'),
    body('safe').isIn(['Safe', 'Unsafe']).withMessage('safe must be Safe or Unsafe.'),
    body('confirmed').isBoolean().withMessage('confirmed must be true or false.'),
  ],
  validate,
  VehicleController.createCheck
);

module.exports = router;
