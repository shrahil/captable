// Shareholder controller
const Shareholder = require('../models/shareholder.model');

// Create a new shareholder
async function create(req, res) {
  try {
    const { name, type, email, phone, address, tax_id, notes } = req.body;
    
    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    // Create shareholder
    const shareholderId = await Shareholder.create({
      name,
      type,
      email,
      phone,
      address,
      tax_id,
      notes
    });
    
    // Get the created shareholder
    const shareholder = await Shareholder.findById(shareholderId);
    
    res.status(201).json({
      message: 'Shareholder created successfully',
      shareholder
    });
  } catch (error) {
    console.error('Create shareholder error:', error);
    res.status(500).json({ message: 'Error creating shareholder', error: error.message });
  }
}

// Get all shareholders
async function getAll(req, res) {
  try {
    const { type, search } = req.query;
    
    const shareholders = await Shareholder.findAll({ type, search });
    
    res.json({ shareholders });
  } catch (error) {
    console.error('Get shareholders error:', error);
    res.status(500).json({ message: 'Error retrieving shareholders', error: error.message });
  }
}

// Get shareholder by ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const shareholder = await Shareholder.findById(id);
    if (!shareholder) {
      return res.status(404).json({ message: 'Shareholder not found' });
    }
    
    res.json({ shareholder });
  } catch (error) {
    console.error('Get shareholder error:', error);
    res.status(500).json({ message: 'Error retrieving shareholder', error: error.message });
  }
}

// Get shareholder with equity details
async function getWithEquity(req, res) {
  try {
    const { id } = req.params;
    
    const shareholder = await Shareholder.getShareholderWithEquity(id);
    if (!shareholder) {
      return res.status(404).json({ message: 'Shareholder not found' });
    }
    
    res.json({ shareholder });
  } catch (error) {
    console.error('Get shareholder with equity error:', error);
    res.status(500).json({ message: 'Error retrieving shareholder equity details', error: error.message });
  }
}

// Update shareholder
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, type, email, phone, address, tax_id, notes } = req.body;
    
    // Check if shareholder exists
    const shareholder = await Shareholder.findById(id);
    if (!shareholder) {
      return res.status(404).json({ message: 'Shareholder not found' });
    }
    
    // Update shareholder
    await Shareholder.update(id, {
      name,
      type,
      email,
      phone,
      address,
      tax_id,
      notes
    });
    
    // Get updated shareholder
    const updatedShareholder = await Shareholder.findById(id);
    
    res.json({
      message: 'Shareholder updated successfully',
      shareholder: updatedShareholder
    });
  } catch (error) {
    console.error('Update shareholder error:', error);
    res.status(500).json({ message: 'Error updating shareholder', error: error.message });
  }
}

// Delete shareholder
async function remove(req, res) {
  try {
    const { id } = req.params;
    
    // Check if shareholder exists
    const shareholder = await Shareholder.findById(id);
    if (!shareholder) {
      return res.status(404).json({ message: 'Shareholder not found' });
    }
    
    // Delete shareholder
    await Shareholder.remove(id);
    
    res.json({ message: 'Shareholder deleted successfully' });
  } catch (error) {
    console.error('Delete shareholder error:', error);
    res.status(500).json({ message: 'Error deleting shareholder', error: error.message });
  }
}

// Get cap table summary
async function getCapTable(req, res) {
  try {
    const shareholders = await Shareholder.getAllWithEquitySummary();
    
    res.json({ shareholders });
  } catch (error) {
    console.error('Get cap table error:', error);
    res.status(500).json({ message: 'Error retrieving cap table', error: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getWithEquity,
  update,
  remove,
  getCapTable
};
