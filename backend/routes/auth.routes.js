// Auth routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

// Update user profile (protected route)
router.put('/profile', authenticateToken, authController.updateProfile);

// Change password (protected route)
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
