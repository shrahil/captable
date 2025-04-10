// User model
const db = require('../utils/db');
const bcrypt = require('bcrypt');

// Create a new user
async function create(userData) {
  const { email, password, first_name, last_name, role } = userData;
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const sql = `
    INSERT INTO users (email, password, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  return db.insert(sql, [email, hashedPassword, first_name, last_name, role || 'employee']);
}

// Find user by email
async function findByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  return db.getOne(sql, [email]);
}

// Find user by ID
async function findById(id) {
  const sql = 'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = ?';
  return db.getOne(sql, [id]);
}

// Update user
async function update(id, userData) {
  const { email, first_name, last_name, role } = userData;
  
  const sql = `
    UPDATE users
    SET email = ?, first_name = ?, last_name = ?, role = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [email, first_name, last_name, role, id]);
}

// Update password
async function updatePassword(id, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  
  return db.update(sql, [hashedPassword, id]);
}

// Delete user
async function remove(id) {
  const sql = 'DELETE FROM users WHERE id = ?';
  return db.remove(sql, [id]);
}

// Get all users
async function findAll() {
  const sql = 'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users';
  return db.query(sql);
}

// Verify password
async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password);
}

module.exports = {
  create,
  findByEmail,
  findById,
  update,
  updatePassword,
  remove,
  findAll,
  verifyPassword
};
