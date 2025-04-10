// Option Plan model
const db = require('../utils/db');

// Create a new option plan
async function create(planData) {
  const { 
    name, 
    share_class_id, 
    total_shares_reserved, 
    start_date, 
    end_date, 
    description 
  } = planData;
  
  const sql = `
    INSERT INTO option_plans (
      name, 
      share_class_id, 
      total_shares_reserved, 
      start_date, 
      end_date, 
      description
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  return db.insert(sql, [
    name, 
    share_class_id, 
    total_shares_reserved, 
    start_date, 
    end_date || null, 
    description
  ]);
}

// Find option plan by ID
async function findById(id) {
  const sql = `
    SELECT op.*, sc.name as share_class_name
    FROM option_plans op
    JOIN share_classes sc ON op.share_class_id = sc.id
    WHERE op.id = ?
  `;
  return db.getOne(sql, [id]);
}

// Update option plan
async function update(id, planData) {
  const { 
    name, 
    end_date, 
    description 
  } = planData;
  
  // Note: We only allow updating name, end_date, and description
  // to prevent breaking existing options
  const sql = `
    UPDATE option_plans
    SET name = ?, 
        end_date = ?, 
        description = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [
    name, 
    end_date, 
    description, 
    id
  ]);
}

// Update total shares reserved
async function updateShares(id, newTotalShares) {
  // Get current plan details
  const plan = await findById(id);
  
  if (!plan) {
    throw new Error('Option plan not found');
  }
  
  // Check if new total is less than already issued
  if (newTotalShares < plan.shares_issued) {
    throw new Error('New total shares cannot be less than already issued shares');
  }
  
  const sql = `
    UPDATE option_plans
    SET total_shares_reserved = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [newTotalShares, id]);
}

// Delete option plan
async function remove(id) {
  // Check if option plan is in use
  const checkSql = `
    SELECT COUNT(*) as count 
    FROM stock_options 
    WHERE option_plan_id = ?
  `;
  
  const result = await db.getOne(checkSql, [id]);
  
  if (result.count > 0) {
    throw new Error('Cannot delete option plan that has options granted');
  }
  
  const sql = 'DELETE FROM option_plans WHERE id = ?';
  return db.remove(sql, [id]);
}

// Get all option plans
async function findAll() {
  const sql = `
    SELECT op.*, 
           sc.name as share_class_name
    FROM option_plans op
    JOIN share_classes sc ON op.share_class_id = sc.id
    ORDER BY op.name ASC
  `;
  return db.query(sql);
}

// Get option plan with grants
async function getWithGrants(id) {
  // Get plan details
  const plan = await findById(id);
  
  if (!plan) {
    return null;
  }
  
  // Get grants
  const grantsSql = `
    SELECT so.*, 
           sh.name as shareholder_name,
           vs.name as vesting_schedule_name
    FROM stock_options so
    JOIN shareholders sh ON so.shareholder_id = sh.id
    JOIN vesting_schedules vs ON so.vesting_schedule_id = vs.id
    WHERE so.option_plan_id = ?
    ORDER BY so.grant_date DESC
  `;
  
  const grants = await db.query(grantsSql, [id]);
  
  return {
    ...plan,
    grants
  };
}

module.exports = {
  create,
  findById,
  update,
  updateShares,
  remove,
  findAll,
  getWithGrants
};
