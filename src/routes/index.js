const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/timesheets', require('./timesheet.routes'));
router.use('/vehicles', require('./vehicle.routes'));
router.use('/incidents', require('./incident.routes'));
router.use('/bulletins', require('./bulletin.routes'));
router.use('/documents', require('./document.routes'));
router.use('/contacts', require('./contact.routes'));

module.exports = router;
