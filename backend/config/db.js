// Database connection utility
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'captable_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute SQL queries
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to get a single record
async function getOne(sql, params) {
  const results = await query(sql, params);
  return results[0];
}

// Helper function to check if a record exists
async function exists(sql, params) {
  const result = await getOne(sql, params);
  return !!result;
}

// Helper function to insert a record and return the inserted ID
async function insert(sql, params) {
  const result = await query(sql, params);
  return result.insertId;
}

// Helper function to update a record and return affected rows
async function update(sql, params) {
  const result = await query(sql, params);
  return result.affectedRows;
}

// Helper function to delete a record and return affected rows
async function remove(sql, params) {
  const result = await query(sql, params);
  return result.affectedRows;
}

// Helper function to begin a transaction
async function beginTransaction() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

// Helper function to commit a transaction
async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

// Helper function to rollback a transaction
async function rollbackTransaction(connection) {
  await connection.rollback();
  connection.release();
}

// Export the database functions
module.exports = {
  query,
  getOne,
  exists,
  insert,
  update,
  remove,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  pool
};