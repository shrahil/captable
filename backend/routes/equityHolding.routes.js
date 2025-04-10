// Equity Holdings routes
const express = require('express');
const router = express.Router();
const equityHoldingController = require('../controllers/equityHolding.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all equity holdings
router.get('/', equityHoldingController.getAll);

// Get equity holding by ID
router.get('/:id', equityHoldingController.getById);

// Create a new equity holding (admin only)
router.post('/', isAdmin, equityHoldingController.create);

// Update equity holding (admin only)
router.put('/:id', isAdmin, equityHoldingController.update);

// Delete equity holding (admin only)
router.delete('/:id', isAdmin, equityHoldingController.remove);

module.exports = router;