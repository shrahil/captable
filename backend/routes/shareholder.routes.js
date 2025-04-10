// Shareholder routes
const express = require('express');
const router = express.Router();
const shareholderController = require('../controllers/shareholder.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all shareholders
router.get('/', shareholderController.getAll);

// Get cap table summary
router.get('/captable', shareholderController.getCapTable);

// Get shareholder by ID
router.get('/:id', shareholderController.getById);

// Get shareholder with equity details
router.get('/:id/equity', shareholderController.getWithEquity);

// Create a new shareholder (admin only)
router.post('/', isAdmin, shareholderController.create);

// Update shareholder (admin only)
router.put('/:id', isAdmin, shareholderController.update);

// Delete shareholder (admin only)
router.delete('/:id', isAdmin, shareholderController.remove);

module.exports = router;
