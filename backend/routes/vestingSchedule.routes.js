// Vesting Schedule routes
const express = require('express');
const router = express.Router();
const vestingScheduleController = require('../controllers/vestingSchedule.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all vesting schedules
router.get('/', vestingScheduleController.getAll);

// Get vesting schedule by ID
router.get('/:id', vestingScheduleController.getById);

// Get vesting schedule usage stats
router.get('/:id/stats', vestingScheduleController.getUsageStats);

// Create a new vesting schedule (admin only)
router.post('/', isAdmin, vestingScheduleController.create);

// Update vesting schedule (admin only)
router.put('/:id', isAdmin, vestingScheduleController.update);

// Delete vesting schedule (admin only)
router.delete('/:id', isAdmin, vestingScheduleController.remove);

module.exports = router;
