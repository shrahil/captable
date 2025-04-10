// Stock Option routes
const express = require('express');
const router = express.Router();
const stockOptionController = require('../controllers/stockOption.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all stock options
router.get('/', stockOptionController.getAll);

// Get stock option by ID
router.get('/:id', stockOptionController.getById);

// Get vesting details for a stock option
router.get('/:id/vesting', stockOptionController.getVestingDetails);

// Get exercise history for a stock option
router.get('/:id/exercises', stockOptionController.getExerciseHistory);

// Create a new stock option (admin only)
router.post('/', isAdmin, stockOptionController.create);

// Update stock option (admin only)
router.put('/:id', isAdmin, stockOptionController.update);

// Cancel stock option (admin only)
router.put('/:id/cancel', isAdmin, stockOptionController.cancel);

// Exercise stock option
router.post('/:id/exercise', stockOptionController.exercise);

module.exports = router;
