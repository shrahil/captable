// Auth controller
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Register a new user
async function register(req, res) {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const userId = await User.create({
      email,
      password,
      first_name,
      last_name,
      role
    });
    
    // Get the created user (without password)
    const user = await User.findById(userId);
    
    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}

// Login user
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const validPassword = await User.verifyPassword(user, password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
}

// Get current user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
}

// Update user profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    await User.update(userId, {
      first_name,
      last_name,
      email,
      role: user.role // Keep the same role
    });
    
    // Get updated user
    const updatedUser = await User.findById(userId);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
    
    // Check if user exists
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const validPassword = await User.verifyPassword(user, current_password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    await User.updatePassword(userId, new_password);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
