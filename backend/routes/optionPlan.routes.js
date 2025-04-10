// Option Plan routes
const express = require('express');
const router = express.Router();
const optionPlanController = require('../controllers/optionPlan.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all option plans
router.get('/', optionPlanController.getAll);

// Get option plan by ID
router.get('/:id', optionPlanController.getById);

// Get option plan with grants
router.get('/:id/grants', optionPlanController.getWithGrants);

// Create a new option plan (admin only)
router.post('/', isAdmin, optionPlanController.create);

// Update option plan (admin only)
router.put('/:id', isAdmin, optionPlanController.update);

// Update total shares reserved (admin only)
router.put('/:id/shares', isAdmin, optionPlanController.updateShares);

// Delete option plan (admin only)
router.delete('/:id', isAdmin, optionPlanController.remove);

module.exports = router;
