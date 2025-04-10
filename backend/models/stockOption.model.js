// Stock Option model
const db = require('../utils/db');

// Create a new stock option
async function create(optionData) {
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
  } = optionData;
  
  const sql = `
    INSERT INTO stock_options (
      option_plan_id, 
      shareholder_id, 
      vesting_schedule_id, 
      grant_date, 
      expiration_date, 
      quantity, 
      exercise_price, 
      vesting_start_date, 
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const connection = await db.beginTransaction();
  
  try {
    // Insert the stock option
    const optionId = await db.insert(sql, [
      option_plan_id, 
      shareholder_id, 
      vesting_schedule_id, 
      grant_date, 
      expiration_date, 
      quantity, 
      exercise_price, 
      vesting_start_date, 
      notes
    ]);
    
    // Update the option plan's shares_issued count
    const updatePlanSql = `
      UPDATE option_plans 
      SET shares_issued = shares_issued + ? 
      WHERE id = ?
    `;
    
    await db.update(updatePlanSql, [quantity, option_plan_id]);
    
    // Generate vesting events based on the vesting schedule
    await generateVestingEvents(optionId, vesting_schedule_id, vesting_start_date, quantity);
    
    await db.commitTransaction(connection);
    return optionId;
  } catch (error) {
    await db.rollbackTransaction(connection);
    throw error;
  }
}

// Generate vesting events for a stock option
async function generateVestingEvents(optionId, vestingScheduleId, startDate, totalShares) {
  // Get the vesting schedule details
  const scheduleSql = 'SELECT * FROM vesting_schedules WHERE id = ?';
  const schedule = await db.getOne(scheduleSql, [vestingScheduleId]);
  
  if (!schedule) {
    throw new Error('Vesting schedule not found');
  }
  
  const { total_duration_months, cliff_months, frequency } = schedule;
  
  // Convert start date to Date object
  const vestingStartDate = new Date(startDate);
  
  // Calculate shares per period based on frequency
  let periodsAfterCliff;
  let monthsPerPeriod;
  
  switch (frequency) {
    case 'monthly':
      monthsPerPeriod = 1;
      periodsAfterCliff = total_duration_months - cliff_months;
      break;
    case 'quarterly':
      monthsPerPeriod = 3;
      periodsAfterCliff = Math.floor((total_duration_months - cliff_months) / 3);
      break;
    case 'annually':
      monthsPerPeriod = 12;
      periodsAfterCliff = Math.floor((total_duration_months - cliff_months) / 12);
      break;
    default:
      monthsPerPeriod = 1;
      periodsAfterCliff = total_duration_months - cliff_months;
  }
  
  // Calculate shares vested at cliff
  const sharesPerPeriod = Math.floor(totalShares / total_duration_months * monthsPerPeriod);
  const sharesAtCliff = Math.floor(totalShares * (cliff_months / total_duration_months));
  
  const vestingEvents = [];
  
  // Add cliff vesting event if there is a cliff
  if (cliff_months > 0) {
    const cliffDate = new Date(vestingStartDate);
    cliffDate.setMonth(cliffDate.getMonth() + cliff_months);
    
    vestingEvents.push({
      stock_option_id: optionId,
      vesting_date: cliffDate.toISOString().split('T')[0],
      shares_vested: sharesAtCliff
    });
  }
  
  // Add remaining vesting events
  let currentDate = new Date(vestingStartDate);
  currentDate.setMonth(currentDate.getMonth() + cliff_months);
  
  let remainingShares = totalShares - sharesAtCliff;
  let sharesVestedSoFar = sharesAtCliff;
  
  for (let i = 0; i < periodsAfterCliff; i++) {
    currentDate.setMonth(currentDate.getMonth() + monthsPerPeriod);
    
    // For the last period, ensure we don't exceed total shares
    let sharesToVest = (i === periodsAfterCliff - 1) 
      ? (totalShares - sharesVestedSoFar) 
      : sharesPerPeriod;
    
    if (sharesToVest <= 0) continue;
    
    vestingEvents.push({
      stock_option_id: optionId,
      vesting_date: currentDate.toISOString().split('T')[0],
      shares_vested: sharesToVest
    });
    
    sharesVestedSoFar += sharesToVest;
  }
  
  // Insert all vesting events
  if (vestingEvents.length > 0) {
    const insertEventsSql = `
      INSERT INTO option_vesting_events (stock_option_id, vesting_date, shares_vested)
      VALUES ?
    `;
    
    const values = vestingEvents.map(event => [
      event.stock_option_id,
      event.vesting_date,
      event.shares_vested
    ]);
    
    await db.query(insertEventsSql, [values]);
  }
}

// Find stock option by ID
async function findById(id) {
  const sql = `
    SELECT so.*, 
           op.name as option_plan_name,
           vs.name as vesting_schedule_name,
           sh.name as shareholder_name
    FROM stock_options so
    JOIN option_plans op ON so.option_plan_id = op.id
    JOIN vesting_schedules vs ON so.vesting_schedule_id = vs.id
    JOIN shareholders sh ON so.shareholder_id = sh.id
    WHERE so.id = ?
  `;
  return db.getOne(sql, [id]);
}

// Update stock option
async function update(id, optionData) {
  const { 
    status, 
    notes 
  } = optionData;
  
  const sql = `
    UPDATE stock_options
    SET status = ?, notes = ?
    WHERE id = ?
  `;
  
  return db.update(sql, [status, notes, id]);
}

// Cancel stock option
async function cancel(id) {
  const connection = await db.beginTransaction();
  
  try {
    // Get the option details
    const option = await findById(id);
    
    if (!option) {
      throw new Error('Stock option not found');
    }
    
    // Update the option status
    const updateSql = `
      UPDATE stock_options
      SET status = 'cancelled'
      WHERE id = ?
    `;
    
    await db.update(updateSql, [id]);
    
    // Update the option plan's shares_issued count
    const updatePlanSql = `
      UPDATE option_plans 
      SET shares_issued = shares_issued - ? 
      WHERE id = ?
    `;
    
    await db.update(updatePlanSql, [option.quantity, option.option_plan_id]);
    
    await db.commitTransaction(connection);
    return true;
  } catch (error) {
    await db.rollbackTransaction(connection);
    throw error;
  }
}

// Exercise stock option
async function exercise(id, exerciseData) {
  const { 
    exercise_date, 
    shares_exercised, 
    notes 
  } = exerciseData;
  
  const connection = await db.beginTransaction();
  
  try {
    // Get the option details
    const option = await findById(id);
    
    if (!option) {
      throw new Error('Stock option not found');
    }
    
    // Calculate vested shares as of exercise date
    const vestedSharesSql = `
      SELECT SUM(shares_vested) as total_vested
      FROM option_vesting_events
      WHERE stock_option_id = ? AND vesting_date <= ?
    `;
    
    const vestedResult = await db.getOne(vestedSharesSql, [id, exercise_date]);
    const totalVestedShares = vestedResult ? vestedResult.total_vested : 0;
    
    // Check if enough shares are vested
    if (totalVestedShares < shares_exercised) {
      throw new Error('Not enough vested shares to exercise');
    }
    
    // Check if already exercised shares + new exercise exceeds total
    const exercisedSharesSql = `
      SELECT SUM(shares_exercised) as total_exercised
      FROM option_exercises
      WHERE stock_option_id = ?
    `;
    
    const exercisedResult = await db.getOne(exercisedSharesSql, [id]);
    const totalExercisedShares = exercisedResult ? exercisedResult.total_exercised : 0;
    
    if (totalExercisedShares + shares_exercised > option.quantity) {
      throw new Error('Exercise amount exceeds available option shares');
    }
    
    // Record the exercise
    const insertExerciseSql = `
      INSERT INTO option_exercises (
        stock_option_id, 
        exercise_date, 
        shares_exercised, 
        exercise_price, 
        notes
      )
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.insert(insertExerciseSql, [
      id, 
      exercise_date, 
      shares_exercised, 
      option.exercise_price, 
      notes
    ]);
    
    // Update option status if all shares are exercised
    if (totalExercisedShares + shares_exercised >= option.quantity) {
      const updateStatusSql = `
        UPDATE stock_options
        SET status = 'exercised'
        WHERE id = ?
      `;
      
      await db.update(updateStatusSql, [id]);
    }
    
    // Record the equity transaction
    const insertTransactionSql = `
      INSERT INTO equity_transactions (
        transaction_type,
        shareholder_id,
        share_class_id,
        quantity,
        price_per_share,
        transaction_date,
        notes
      )
      VALUES ('exercise', ?, ?, ?, ?, ?, ?)
    `;
    
    // Get the share class ID from the option plan
    const shareClassSql = `
      SELECT share_class_id
      FROM option_plans
      WHERE id = ?
    `;
    
    const shareClassResult = await db.getOne(shareClassSql, [option.option_plan_id]);
    
    await db.insert(insertTransactionSql, [
      option.shareholder_id,
      shareClassResult.share_class_id,
      shares_exercised,
      option.exercise_price,
      exercise_date,
      `Option exercise from grant ${option.id}`
    ]);
    
    // Create equity holding or update existing
    const holdingSql = `
      SELECT id
      FROM equity_holdings
      WHERE shareholder_id = ? AND share_class_id = ?
    `;
    
    const holdingResult = await db.getOne(holdingSql, [
      option.shareholder_id,
      shareClassResult.share_class_id
    ]);
    
    if (holdingResult) {
      // Update existing holding
      const updateHoldingSql = `
        UPDATE equity_holdings
        SET quantity = quantity + ?
        WHERE id = ?
      `;
      
      await db.update(updateHoldingSql, [shares_exercised, holdingResult.id]);
    } else {
      // Create new holding
      const insertHoldingSql = `
        INSERT INTO equity_holdings (
          shareholder_id,
          share_class_id,
          quantity,
          price_per_share,
          issue_date,
          certificate_number,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.insert(insertHoldingSql, [
        option.shareholder_id,
        shareClassResult.share_class_id,
        shares_exercised,
        option.exercise_price,
        exercise_date,
        `EX-${Date.now()}`,
        `From option exercise ID ${option.id}`
      ]);
    }
    
    await db.commitTransaction(connection);
    return true;
  } catch (error) {
    await db.rollbackTransaction(connection);
    throw error;
  }
}

// Get all stock options
async function findAll(filters = {}) {
  let sql = `
    SELECT so.*, 
           op.name as option_plan_name,
           vs.name as vesting_schedule_name,
           sh.name as shareholder_name
    FROM stock_options so
    JOIN option_plans op ON so.option_plan_id = op.id
    JOIN vesting_schedules vs ON so.vesting_schedule_id = vs.id
    JOIN shareholders sh ON so.shareholder_id = sh.id
  `;
  
  const params = [];
  
  // Add filters if provided
  const whereConditions = [];
  
  if (filters.status) {
    whereConditions.push('so.status = ?');
    params.push(filters.status);
  }
  
  if (filters.shareholder_id) {
    whereConditions.push('so.shareholder_id = ?');
    params.push(filters.shareholder_id);
  }
  
  if (filters.option_plan_id) {
    whereConditions.push('so.option_plan_id = ?');
    params.push(filters.option_plan_id);
  }
  
  if (whereConditions.length > 0) {
    sql += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  // Add ordering
  sql += ' ORDER BY so.grant_date DESC';
  
  return db.query(sql, params);
}

// Get vesting details for a stock option
async function getVestingDetails(id) {
  const sql = `
    SELECT ove.*
    FROM option_vesting_events ove
    WHERE ove.stock_option_id = ?
    ORDER BY ove.vesting_date ASC
  `;
  
  return db.query(sql, [id]);
}

// Get exercise history for a stock option
async function getExerciseHistory(id) {
  const sql = `
    SELECT oe.*
    FROM option_exercises oe
    WHERE oe.stock_option_id = ?
    ORDER BY oe.exercise_date ASC
  `;
  
  return db.query(sql, [id]);
}

module.exports = {
  create,
  findById,
  update,
  cancel,
  exercise,
  findAll,
  getVestingDetails,
  getExerciseHistory
};
