// Vesting Schedule controller
const VestingSchedule = require('../models/vestingSchedule.model');

// Create a new vesting schedule
async function create(req, res) {
  try {
    const { 
      name, 
      total_duration_months, 
      cliff_months, 
      frequency, 
      acceleration_on_exit, 
      description 
    } = req.body;
    
    // Validate required fields
    if (!name || !total_duration_months) {
      return res.status(400).json({ message: 'Name and total duration are required' });
    }
    
    // Create vesting schedule
    const scheduleId = await VestingSchedule.create({
      name,
      total_duration_months,
      cliff_months,
      frequency,
      acceleration_on_exit,
      description
    });
    
    // Get the created vesting schedule
    const schedule = await VestingSchedule.findById(scheduleId);
    
    res.status(201).json({
      message: 'Vesting schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Create vesting schedule error:', error);
    res.status(500).json({ message: 'Error creating vesting schedule', error: error.message });
  }
}

// Get all vesting schedules
async function getAll(req, res) {
  try {
    const schedules = await VestingSchedule.findAll();
    
    res.json({ schedules });
  } catch (error) {
    console.error('Get vesting schedules error:', error);
    res.status(500).json({ message: 'Error retrieving vesting schedules', error: error.message });
  }
}

// Get vesting schedule by ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const schedule = await VestingSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Vesting schedule not found' });
    }
    
    res.json({ schedule });
  } catch (error) {
    console.error('Get vesting schedule error:', error);
    res.status(500).json({ message: 'Error retrieving vesting schedule', error: error.message });
  }
}

// Get vesting schedule usage stats
async function getUsageStats(req, res) {
  try {
    const { id } = req.params;
    
    const stats = await VestingSchedule.getUsageStats(id);
    if (!stats) {
      return res.status(404).json({ message: 'Vesting schedule not found' });
    }
    
    res.json({ stats });
  } catch (error) {
    console.error('Get vesting schedule usage stats error:', error);
    res.status(500).json({ message: 'Error retrieving vesting schedule usage stats', error: error.message });
  }
}

// Update vesting schedule
async function update(req, res) {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      acceleration_on_exit 
    } = req.body;
    
    // Check if vesting schedule exists
    const schedule = await VestingSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Vesting schedule not found' });
    }
    
    // Update vesting schedule
    await VestingSchedule.update(id, {
      name,
      description,
      acceleration_on_exit
    });
    
    // Get updated vesting schedule
    const updatedSchedule = await VestingSchedule.findById(id);
    
    res.json({
      message: 'Vesting schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Update vesting schedule error:', error);
    res.status(500).json({ message: 'Error updating vesting schedule', error: error.message });
  }
}

// Delete vesting schedule
async function remove(req, res) {
  try {
    const { id } = req.params;
    
    // Check if vesting schedule exists
    const schedule = await VestingSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Vesting schedule not found' });
    }
    
    // Delete vesting schedule
    await VestingSchedule.remove(id);
    
    res.json({ message: 'Vesting schedule deleted successfully' });
  } catch (error) {
    console.error('Delete vesting schedule error:', error);
    res.status(500).json({ message: 'Error deleting vesting schedule', error: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getUsageStats,
  update,
  remove
};
