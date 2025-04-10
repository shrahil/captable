// Shareholder model
const db = require('../utils/db');

// Create a new shareholder
async function create(shareholderData) {
  const { name, type, email, phone = null, address = null, tax_id = null, notes = null } = shareholderData;
  
  const sql = `
    INSERT INTO shareholders (name, type, email, phone, address, tax_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  return db.insert(sql, [name, type, email, phone, address, tax_id, notes]);
}

// Find shareholder by ID
async function findById(id) {
  const sql = 'SELECT * FROM shareholders WHERE id = ?';
  return db.getOne(sql, [id]);
}

// Update shareholder
async function update(id, shareholderData) {
  const { name, type, email, phone = null, address = null, tax_id = null, notes = null } = shareholderData;
  
  const sql = `
    UPDATE shareholders
    SET name = ?, type = ?, email = ?, phone = ?, address = ?, tax_id = ?, notes = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [name, type, email, phone, address, tax_id, notes, id]);
}

// Delete shareholder
async function remove(id) {
  const sql = 'DELETE FROM shareholders WHERE id = ?';
  return db.remove(sql, [id]);
}

// Get all shareholders
async function findAll(filters = {}) {
  let sql = 'SELECT * FROM shareholders';
  const params = [];
  
  // Add filters if provided
  const whereConditions = [];
  
  if (filters.type) {
    whereConditions.push('type = ?');
    params.push(filters.type);
  }
  
  if (filters.search) {
    whereConditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  
  if (whereConditions.length > 0) {
    sql += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  // Add ordering
  sql += ' ORDER BY name ASC';
  
  return db.query(sql, params);
}

// Get shareholder with equity holdings
async function getShareholderWithEquity(id) {
  const sql = `
    SELECT s.*, 
           SUM(eh.quantity) as total_shares,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', eh.id,
               'share_class_id', eh.share_class_id,
               'quantity', eh.quantity,
               'price_per_share', eh.price_per_share,
               'investment_amount', eh.investment_amount,
               'issue_date', eh.issue_date,
               'certificate_number', eh.certificate_number
             )
           ) as equity_holdings
    FROM shareholders s
    LEFT JOIN equity_holdings eh ON s.id = eh.shareholder_id
    WHERE s.id = ?
    GROUP BY s.id
  `;
  
  return db.getOne(sql, [id]);
}

// Get all shareholders with equity summary
async function getAllWithEquitySummary() {
  const sql = `
    SELECT s.*, 
           SUM(eh.quantity) as total_shares,
           COUNT(DISTINCT eh.share_class_id) as share_class_count
    FROM shareholders s
    LEFT JOIN equity_holdings eh ON s.id = eh.shareholder_id
    GROUP BY s.id
    ORDER BY s.name ASC
  `;
  
  return db.query(sql);
}

module.exports = {
  create,
  findById,
  update,
  remove,
  findAll,
  getShareholderWithEquity,
  getAllWithEquitySummary
};
