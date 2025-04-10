// Share Class routes
const express = require('express');
const router = express.Router();
const shareClassController = require('../controllers/shareClass.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all share classes
router.get('/', shareClassController.getAll);

// Get all share classes with total shares
router.get('/with-totals', shareClassController.getAllWithTotalShares);

// Get share class by ID
router.get('/:id', shareClassController.getById);

// Get share class with total shares
router.get('/:id/with-totals', shareClassController.getWithTotalShares);

// Create a new share class (admin only)
router.post('/', isAdmin, shareClassController.create);

// Update share class (admin only)
router.put('/:id', isAdmin, shareClassController.update);

// Delete share class (admin only)
router.delete('/:id', isAdmin, shareClassController.remove);

module.exports = router;
