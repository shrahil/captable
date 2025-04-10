// Option Plan controller
const OptionPlan = require('../models/optionPlan.model');
const ShareClass = require('../models/shareClass.model');

// Create a new option plan
async function create(req, res) {
  try {
    const { 
      name, 
      share_class_id, 
      total_shares_reserved, 
      start_date, 
      end_date, 
      description 
    } = req.body;
    
    // Validate required fields
    if (!name || !share_class_id || !total_shares_reserved || !start_date) {
      return res.status(400).json({ 
        message: 'Name, share class, total shares, and start date are required' 
      });
    }
    
    // Check if share class exists
    const shareClass = await ShareClass.findById(share_class_id);
    if (!shareClass) {
      return res.status(404).json({ message: 'Share class not found' });
    }
    
    // Create option plan
    const planId = await OptionPlan.create({
      name,
      share_class_id,
      total_shares_reserved,
      start_date,
      end_date,
      description
    });
    
    // Get the created option plan
    const plan = await OptionPlan.findById(planId);
    
    res.status(201).json({
      message: 'Option plan created successfully',
      plan
    });
  } catch (error) {
    console.error('Create option plan error:', error);
    res.status(500).json({ message: 'Error creating option plan', error: error.message });
  }
}

// Get all option plans
async function getAll(req, res) {
  try {
    const plans = await OptionPlan.findAll();
    
    res.json({ plans });
  } catch (error) {
    console.error('Get option plans error:', error);
    res.status(500).json({ message: 'Error retrieving option plans', error: error.message });
  }
}

// Get option plan by ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const plan = await OptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Option plan not found' });
    }
    
    res.json({ plan });
  } catch (error) {
    console.error('Get option plan error:', error);
    res.status(500).json({ message: 'Error retrieving option plan', error: error.message });
  }
}

// Get option plan with grants
async function getWithGrants(req, res) {
  try {
    const { id } = req.params;
    
    const plan = await OptionPlan.getWithGrants(id);
    if (!plan) {
      return res.status(404).json({ message: 'Option plan not found' });
    }
    
    res.json({ plan });
  } catch (error) {
    console.error('Get option plan with grants error:', error);
    res.status(500).json({ message: 'Error retrieving option plan with grants', error: error.message });
  }
}

// Update option plan
async function update(req, res) {
  try {
    const { id } = req.params;
    const { 
      name, 
      end_date, 
      description 
    } = req.body;
    
    // Check if option plan exists
    const plan = await OptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Option plan not found' });
    }
    
    // Update option plan
    await OptionPlan.update(id, {
      name,
      end_date,
      description
    });
    
    // Get updated option plan
    const updatedPlan = await OptionPlan.findById(id);
    
    res.json({
      message: 'Option plan updated successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Update option plan error:', error);
    res.status(500).json({ message: 'Error updating option plan', error: error.message });
  }
}

// Update total shares reserved
async function updateShares(req, res) {
  try {
    const { id } = req.params;
    const { total_shares_reserved } = req.body;
    
    if (!total_shares_reserved) {
      return res.status(400).json({ message: 'Total shares reserved is required' });
    }
    
    // Check if option plan exists
    const plan = await OptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Option plan not found' });
    }
    
    // Update total shares
    await OptionPlan.updateShares(id, total_shares_reserved);
    
    // Get updated option plan
    const updatedPlan = await OptionPlan.findById(id);
    
    res.json({
      message: 'Option plan shares updated successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Update option plan shares error:', error);
    res.status(500).json({ message: 'Error updating option plan shares', error: error.message });
  }
}

// Delete option plan
async function remove(req, res) {
  try {
    const { id } = req.params;
    
    // Check if option plan exists
    const plan = await OptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Option plan not found' });
    }
    
    // Delete option plan
    await OptionPlan.remove(id);
    
    res.json({ message: 'Option plan deleted successfully' });
  } catch (error) {
    console.error('Delete option plan error:', error);
    res.status(500).json({ message: 'Error deleting option plan', error: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getWithGrants,
  update,
  updateShares,
  remove
};
