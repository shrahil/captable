const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createAdminUser() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'captable_db'
    });

    // Admin user details
    const email = 'admin@example.com';
    const password = 'admin123'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(password, 10);
    const firstName = 'Admin';
    const lastName = 'User';
    const role = 'admin';

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists.');
      connection.end();
      return;
    }

    // Insert admin user
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role]
    );

    console.log(`Admin user created with ID: ${result.insertId}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    // Close the connection
    connection.end();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Execute the function
createAdminUser();
