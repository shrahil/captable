// Stock Option controller
const StockOption = require('../models/stockOption.model');
const OptionPlan = require('../models/optionPlan.model');
const Shareholder = require('../models/shareholder.model');
const VestingSchedule = require('../models/vestingSchedule.model');

// Create a new stock option
async function create(req, res) {
  try {
    const { 
      option_plan_id, 
      shareholder_id, 
      vesting_schedule_id, 
      grant_date, 
      expiration_date, 
      quantity, 
      exercise_price, 
      vesting_start_date, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!option_plan_id || !shareholder_id || !vesting_schedule_id || !grant_date || 
        !expiration_date || !quantity || !exercise_price || !vesting_start_date) {
      return res.status(400).json({ 
        message: 'Missing required fields for stock option creation' 
      });
    }
    
    // Check if option plan exists
    const optionPlan = await OptionPlan.findById(option_plan_id);
    if (!optionPlan) {
      return res.status(404).json({ message: 'Option plan not found' });
    }
    
    // Check if shareholder exists
    const shareholder = await Shareholder.findById(shareholder_id);
    if (!shareholder) {
      return res.status(404).json({ message: 'Shareholder not found' });
    }
    
    // Check if vesting schedule exists
    const vestingSchedule = await VestingSchedule.findById(vesting_schedule_id);
    if (!vestingSchedule) {
      return res.status(404).json({ message: 'Vesting schedule not found' });
    }
    
    // Check if there are enough shares available in the plan
    if (optionPlan.shares_available < quantity) {
      return res.status(400).json({ 
        message: 'Not enough shares available in the option plan',
        available: optionPlan.shares_available,
        requested: quantity
      });
    }
    
    // Create stock option
    const optionId = await StockOption.create({
      option_plan_id, 
      shareholder_id, 
      vesting_schedule_id, 
      grant_date, 
      expiration_date, 
      quantity, 
      exercise_price, 
      vesting_start_date, 
      notes
    });
    
    // Get the created option with details
    const option = await StockOption.findById(optionId);
    
    res.status(201).json({
      message: 'Stock option created successfully',
      option
    });
  } catch (error) {
    console.error('Create stock option error:', error);
    res.status(500).json({ message: 'Error creating stock option', error: error.message });
  }
}

// Get all stock options
async function getAll(req, res) {
  try {
    const { status, shareholder_id, option_plan_id } = req.query;
    
    const options = await StockOption.findAll({ 
      status, 
      shareholder_id, 
      option_plan_id 
    });
    
    res.json({ options });
  } catch (error) {
    console.error('Get stock options error:', error);
    res.status(500).json({ message: 'Error retrieving stock options', error: error.message });
  }
}

// Get stock option by ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const option = await StockOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Stock option not found' });
    }
    
    res.json({ option });
  } catch (error) {
    console.error('Get stock option error:', error);
    res.status(500).json({ message: 'Error retrieving stock option', error: error.message });
  }
}

// Get vesting details for a stock option
async function getVestingDetails(req, res) {
  try {
    const { id } = req.params;
    
    // Check if option exists
    const option = await StockOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Stock option not found' });
    }
    
    const vestingEvents = await StockOption.getVestingDetails(id);
    
    res.json({ 
      option,
      vestingEvents 
    });
  } catch (error) {
    console.error('Get vesting details error:', error);
    res.status(500).json({ message: 'Error retrieving vesting details', error: error.message });
  }
}

// Update stock option
async function update(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Check if option exists
    const option = await StockOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Stock option not found' });
    }
    
    // Update option
    await StockOption.update(id, {
      status,
      notes
    });
    
    // Get updated option
    const updatedOption = await StockOption.findById(id);
    
    res.json({
      message: 'Stock option updated successfully',
      option: updatedOption
    });
  } catch (error) {
    console.error('Update stock option error:', error);
    res.status(500).json({ message: 'Error updating stock option', error: error.message });
  }
}

// Cancel stock option
async function cancel(req, res) {
  try {
    const { id } = req.params;
    
    // Check if option exists
    const option = await StockOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Stock option not found' });
    }
    
    // Cancel option
    await StockOption.cancel(id);
    
    res.json({ message: 'Stock option cancelled successfully' });
  } catch (error) {
    console.error('Cancel stock option error:', error);
    res.status(500).json({ message: 'Error cancelling stock option', error: error.message });
  }
}

// Exercise stock option
async function exercise(req, res) {
  try {
    const { id } = req.params;
    const { exercise_date, shares_exercised, notes } = req.body;
    
    // Validate required fields
    if (!exercise_date || !shares_exercised) {
      return res.status(400).json({ 
        message: 'Exercise date and shares exercised are required' 
      });
    }
    
    // Check if option exists
    const option = await StockOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Stock option not found' });
    }
    
    // Exercise option
    await StockOption.exercise(id, {
      exercise_date,
      shares_exercised,
      notes
    });
    
    res.json({ 
      message: 'Stock option exercised successfully',
      shares_exercised
    });
  } catch (error) {
    console.error('Exercise stock option error:', error);
    res.status(500).json({ message: 'Error exercising stock option', error: error.message });
  }
}

// Get exercise history for a stock option
async function getExerciseHistory(req, res) {
  try {
    const { id } = req.params;
    
    // Check if option exists
    const option = await StockOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Stock option not found' });
    }
    
    const exercises = await StockOption.getExerciseHistory(id);
    
    res.json({ 
      option,
      exercises 
    });
  } catch (error) {
    console.error('Get exercise history error:', error);
    res.status(500).json({ message: 'Error retrieving exercise history', error: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getVestingDetails,
  update,
  cancel,
  exercise,
  getExerciseHistory
};
