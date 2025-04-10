// Equity Holdings controller
const db = require('../utils/db');

// Create a new equity holding
async function create(req, res) {
  try {
    const { shareholder_id, share_class_id, quantity, price_per_share, issue_date, certificate_number = null, notes = null } = req.body;
    
    // Validate required fields
    if (!shareholder_id || !share_class_id || !quantity || !price_per_share || !issue_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create equity holding
    const sql = `
      INSERT INTO equity_holdings (shareholder_id, share_class_id, quantity, price_per_share, issue_date, certificate_number, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const holdingId = await db.insert(sql, [
      shareholder_id, share_class_id, quantity, price_per_share, issue_date, certificate_number, notes
    ]);
    
    // Get the created equity holding
    const holding = await findById(holdingId);
    
    // Record the transaction
    await recordTransaction(shareholder_id, share_class_id, quantity, price_per_share, issue_date, 'issuance', notes);
    
    res.status(201).json({
      message: 'Equity holding created successfully',
      holding
    });
  } catch (error) {
    console.error('Create equity holding error:', error);
    res.status(500).json({ message: 'Error creating equity holding', error: error.message });
  }
}

// Get all equity holdings
async function getAll(req, res) {
  try {
    const { shareholder_id, share_class_id } = req.query;
    
    let sql = `
      SELECT eh.*, 
             s.name as shareholder_name,
             sc.name as share_class_name
      FROM equity_holdings eh
      JOIN shareholders s ON eh.shareholder_id = s.id
      JOIN share_classes sc ON eh.share_class_id = sc.id
    `;
    
    const params = [];
    const whereConditions = [];
    
    if (shareholder_id) {
      whereConditions.push('eh.shareholder_id = ?');
      params.push(shareholder_id);
    }
    
    if (share_class_id) {
      whereConditions.push('eh.share_class_id = ?');
      params.push(share_class_id);
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ' ORDER BY eh.issue_date DESC';
    
    const holdings = await db.query(sql, params);
    
    res.json({ holdings });
  } catch (error) {
    console.error('Get equity holdings error:', error);
    res.status(500).json({ message: 'Error retrieving equity holdings', error: error.message });
  }
}

// Get equity holding by ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const holding = await findById(id);
    if (!holding) {
      return res.status(404).json({ message: 'Equity holding not found' });
    }
    
    res.json({ holding });
  } catch (error) {
    console.error('Get equity holding error:', error);
    res.status(500).json({ message: 'Error retrieving equity holding', error: error.message });
  }
}

// Update equity holding
async function update(req, res) {
  try {
    const { id } = req.params;
    const { quantity, price_per_share, issue_date, certificate_number = null, notes = null } = req.body;
    
    // Get current holding
    const holding = await findById(id);
    if (!holding) {
      return res.status(404).json({ message: 'Equity holding not found' });
    }
    
    // Check for quantity change to record transaction
    const quantityChange = quantity - holding.quantity;
    
    // Update equity holding
    const sql = `
      UPDATE equity_holdings
      SET quantity = ?, price_per_share = ?, issue_date = ?, certificate_number = ?, notes = ?
      WHERE id = ?
    `;
    
    await db.update(sql, [
      quantity, price_per_share, issue_date, certificate_number, notes, id
    ]);
    
    // If quantity changed, record a transaction
    if (quantityChange !== 0) {
      const transactionType = quantityChange > 0 ? 'issuance' : 'repurchase';
      const absQuantityChange = Math.abs(quantityChange);
      
      await recordTransaction(
        holding.shareholder_id, 
        holding.share_class_id, 
        absQuantityChange, 
        price_per_share, 
        new Date().toISOString().split('T')[0], 
        transactionType,
        `Update to holding #${id}`
      );
    }
    
    // Get updated equity holding
    const updatedHolding = await findById(id);
    
    res.json({
      message: 'Equity holding updated successfully',
      holding: updatedHolding
    });
  } catch (error) {
    console.error('Update equity holding error:', error);
    res.status(500).json({ message: 'Error updating equity holding', error: error.message });
  }
}

// Delete equity holding
async function remove(req, res) {
  try {
    const { id } = req.params;
    
    // Check if equity holding exists
    const holding = await findById(id);
    if (!holding) {
      return res.status(404).json({ message: 'Equity holding not found' });
    }
    
    // Record a cancellation transaction
    await recordTransaction(
      holding.shareholder_id,
      holding.share_class_id,
      holding.quantity,
      holding.price_per_share,
      new Date().toISOString().split('T')[0],
      'cancellation',
      `Deleted holding #${id}`
    );
    
    // Delete equity holding
    const sql = 'DELETE FROM equity_holdings WHERE id = ?';
    await db.remove(sql, [id]);
    
    res.json({ message: 'Equity holding deleted successfully' });
  } catch (error) {
    console.error('Delete equity holding error:', error);
    res.status(500).json({ message: 'Error deleting equity holding', error: error.message });
  }
}

// Helper function to find equity holding by ID
async function findById(id) {
  const sql = `
    SELECT eh.*, 
           s.name as shareholder_name,
           sc.name as share_class_name
    FROM equity_holdings eh
    JOIN shareholders s ON eh.shareholder_id = s.id
    JOIN share_classes sc ON eh.share_class_id = sc.id
    WHERE eh.id = ?
  `;
  return db.getOne(sql, [id]);
}

// Helper function to record a transaction
async function recordTransaction(shareholder_id, share_class_id, quantity, price_per_share, transaction_date, transaction_type, notes = null) {
  const sql = `
    INSERT INTO equity_transactions 
    (transaction_type, shareholder_id, share_class_id, quantity, price_per_share, transaction_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  return db.insert(sql, [
    transaction_type, shareholder_id, share_class_id, quantity, price_per_share, transaction_date, notes
  ]);
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};
