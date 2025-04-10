// Vesting Schedule model
const db = require('../utils/db');

// Create a new vesting schedule
async function create(vestingData) {
  const { 
    name, 
    total_duration_months, 
    cliff_months, 
    frequency, 
    acceleration_on_exit, 
    description 
  } = vestingData;
  
  const sql = `
    INSERT INTO vesting_schedules (
      name, 
      total_duration_months, 
      cliff_months, 
      frequency, 
      acceleration_on_exit, 
      description
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  return db.insert(sql, [
    name, 
    total_duration_months, 
    cliff_months || 12, 
    frequency || 'monthly', 
    acceleration_on_exit || false, 
    description
  ]);
}

// Find vesting schedule by ID
async function findById(id) {
  const sql = 'SELECT * FROM vesting_schedules WHERE id = ?';
  return db.getOne(sql, [id]);
}

// Update vesting schedule
async function update(id, vestingData) {
  const { 
    name, 
    description, 
    acceleration_on_exit 
  } = vestingData;
  
  // Note: We only allow updating name, description, and acceleration_on_exit
  // to prevent breaking existing options
  const sql = `
    UPDATE vesting_schedules
    SET name = ?, 
        description = ?, 
        acceleration_on_exit = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [
    name, 
    description, 
    acceleration_on_exit, 
    id
  ]);
}

// Delete vesting schedule
async function remove(id) {
  // Check if vesting schedule is in use
  const checkSql = `
    SELECT COUNT(*) as count 
    FROM stock_options 
    WHERE vesting_schedule_id = ?
  `;
  
  const result = await db.getOne(checkSql, [id]);
  
  if (result.count > 0) {
    throw new Error('Cannot delete vesting schedule that is in use');
  }
  
  const sql = 'DELETE FROM vesting_schedules WHERE id = ?';
  return db.remove(sql, [id]);
}

// Get all vesting schedules
async function findAll() {
  const sql = 'SELECT * FROM vesting_schedules ORDER BY name ASC';
  return db.query(sql);
}

// Get vesting schedule usage stats
async function getUsageStats(id) {
  const sql = `
    SELECT vs.*, 
           COUNT(DISTINCT so.id) as option_count,
           COUNT(DISTINCT so.shareholder_id) as employee_count,
           SUM(so.quantity) as total_shares
    FROM vesting_schedules vs
    LEFT JOIN stock_options so ON vs.id = so.vesting_schedule_id
    WHERE vs.id = ?
    GROUP BY vs.id
  `;
  
  return db.getOne(sql, [id]);
}

module.exports = {
  create,
  findById,
  update,
  remove,
  findAll,
  getUsageStats
};
