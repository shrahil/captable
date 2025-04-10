const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'captable_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testDBConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Import routes
const authRoutes = require('./routes/auth.routes');
const shareholderRoutes = require('./routes/shareholder.routes');
const stockOptionRoutes = require('./routes/stockOption.routes');
const shareClassRoutes = require('./routes/shareClass.routes');
const vestingScheduleRoutes = require('./routes/vestingSchedule.routes');
const optionPlanRoutes = require('./routes/optionPlan.routes');
const reportRoutes = require('./routes/report.routes');
const equityHoldingRoutes = require('./routes/equityHolding.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/shareholders', shareholderRoutes);
app.use('/api/options', stockOptionRoutes);
app.use('/api/share-classes', shareClassRoutes);
app.use('/api/vesting-schedules', vestingScheduleRoutes);
app.use('/api/option-plans', optionPlanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/equity-holdings', equityHoldingRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GoodEd Technologies Cap Table Management API' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware with more detailed error information
app.use((err, req, res, next) => {
  console.error('ERROR DETAILS:', err);
  console.error('Error Stack:', err.stack);
  
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testDBConnection();
});

module.exports = app;