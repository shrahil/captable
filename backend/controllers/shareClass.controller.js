// Share Class controller
const ShareClass = require('../models/shareClass.model');

// Create a new share class
async function create(req, res) {
  try {
    const { 
      name, 
      description, 
      liquidation_preference, 
      conversion_ratio, 
      is_preferred 
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Create share class
    const shareClassId = await ShareClass.create({
      name,
      description,
      liquidation_preference,
      conversion_ratio,
      is_preferred
    });
    
    // Get the created share class
    const shareClass = await ShareClass.findById(shareClassId);
    
    res.status(201).json({
      message: 'Share class created successfully',
      shareClass
    });
  } catch (error) {
    console.error('Create share class error:', error);
    res.status(500).json({ message: 'Error creating share class', error: error.message });
  }
}

// Get all share classes
async function getAll(req, res) {
  try {
    const shareClasses = await ShareClass.findAll();
    
    res.json({ shareClasses });
  } catch (error) {
    console.error('Get share classes error:', error);
    res.status(500).json({ message: 'Error retrieving share classes', error: error.message });
  }
}

// Get all share classes with total shares
async function getAllWithTotalShares(req, res) {
  try {
    const shareClasses = await ShareClass.getAllWithTotalShares();
    
    res.json({ shareClasses });
  } catch (error) {
    console.error('Get share classes with total shares error:', error);
    res.status(500).json({ message: 'Error retrieving share classes with total shares', error: error.message });
  }
}

// Get share class by ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const shareClass = await ShareClass.findById(id);
    if (!shareClass) {
      return res.status(404).json({ message: 'Share class not found' });
    }
    
    res.json({ shareClass });
  } catch (error) {
    console.error('Get share class error:', error);
    res.status(500).json({ message: 'Error retrieving share class', error: error.message });
  }
}

// Get share class with total shares
async function getWithTotalShares(req, res) {
  try {
    const { id } = req.params;
    
    const shareClass = await ShareClass.getWithTotalShares(id);
    if (!shareClass) {
      return res.status(404).json({ message: 'Share class not found' });
    }
    
    res.json({ shareClass });
  } catch (error) {
    console.error('Get share class with total shares error:', error);
    res.status(500).json({ message: 'Error retrieving share class with total shares', error: error.message });
  }
}

// Update share class
async function update(req, res) {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      liquidation_preference, 
      conversion_ratio, 
      is_preferred 
    } = req.body;
    
    // Check if share class exists
    const shareClass = await ShareClass.findById(id);
    if (!shareClass) {
      return res.status(404).json({ message: 'Share class not found' });
    }
    
    // Update share class
    await ShareClass.update(id, {
      name,
      description,
      liquidation_preference,
      conversion_ratio,
      is_preferred
    });
    
    // Get updated share class
    const updatedShareClass = await ShareClass.findById(id);
    
    res.json({
      message: 'Share class updated successfully',
      shareClass: updatedShareClass
    });
  } catch (error) {
    console.error('Update share class error:', error);
    res.status(500).json({ message: 'Error updating share class', error: error.message });
  }
}

// Delete share class
async function remove(req, res) {
  try {
    const { id } = req.params;
    
    // Check if share class exists
    const shareClass = await ShareClass.findById(id);
    if (!shareClass) {
      return res.status(404).json({ message: 'Share class not found' });
    }
    
    // Delete share class
    await ShareClass.remove(id);
    
    res.json({ message: 'Share class deleted successfully' });
  } catch (error) {
    console.error('Delete share class error:', error);
    res.status(500).json({ message: 'Error deleting share class', error: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getAllWithTotalShares,
  getById,
  getWithTotalShares,
  update,
  remove
};
