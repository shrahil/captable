// Share Class model
const db = require('../utils/db');

// Create a new share class
async function create(shareClassData) {
  const { 
    name, 
    description, 
    liquidation_preference, 
    conversion_ratio, 
    is_preferred 
  } = shareClassData;
  
  const sql = `
    INSERT INTO share_classes (
      name, 
      description, 
      liquidation_preference, 
      conversion_ratio, 
      is_preferred
    )
    VALUES (?, ?, ?, ?, ?)
  `;
  
  return db.insert(sql, [
    name, 
    description, 
    liquidation_preference || 1.0, 
    conversion_ratio || 1.0, 
    is_preferred || false
  ]);
}

// Find share class by ID
async function findById(id) {
  const sql = 'SELECT * FROM share_classes WHERE id = ?';
  return db.getOne(sql, [id]);
}

// Update share class
async function update(id, shareClassData) {
  const { 
    name, 
    description, 
    liquidation_preference, 
    conversion_ratio, 
    is_preferred 
  } = shareClassData;
  
  const sql = `
    UPDATE share_classes
    SET name = ?, 
        description = ?, 
        liquidation_preference = ?, 
        conversion_ratio = ?, 
        is_preferred = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [
    name, 
    description, 
    liquidation_preference, 
    conversion_ratio, 
    is_preferred, 
    id
  ]);
}

// Delete share class
async function remove(id) {
  // Check if share class is in use
  const checkSql = `
    SELECT COUNT(*) as count 
    FROM equity_holdings 
    WHERE share_class_id = ?
  `;
  
  const result = await db.getOne(checkSql, [id]);
  
  if (result.count > 0) {
    throw new Error('Cannot delete share class that is in use');
  }
  
  const sql = 'DELETE FROM share_classes WHERE id = ?';
  return db.remove(sql, [id]);
}

// Get all share classes
async function findAll() {
  const sql = 'SELECT * FROM share_classes ORDER BY name ASC';
  return db.query(sql);
}

// Get share class with total shares
async function getWithTotalShares(id) {
  const sql = `
    SELECT sc.*, 
           SUM(eh.quantity) as total_shares,
           COUNT(DISTINCT eh.shareholder_id) as shareholder_count
    FROM share_classes sc
    LEFT JOIN equity_holdings eh ON sc.id = eh.share_class_id
    WHERE sc.id = ?
    GROUP BY sc.id
  `;
  
  return db.getOne(sql, [id]);
}

// Get all share classes with total shares
async function getAllWithTotalShares() {
  const sql = `
    SELECT sc.*, 
           SUM(eh.quantity) as total_shares,
           COUNT(DISTINCT eh.shareholder_id) as shareholder_count
    FROM share_classes sc
    LEFT JOIN equity_holdings eh ON sc.id = eh.share_class_id
    GROUP BY sc.id
    ORDER BY sc.name ASC
  `;
  
  return db.query(sql);
}

module.exports = {
  create,
  findById,
  update,
  remove,
  findAll,
  getWithTotalShares,
  getAllWithTotalShares
};
