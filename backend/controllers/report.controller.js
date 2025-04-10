// Report controller
const db = require('../utils/db');
const Shareholder = require('../models/shareholder.model');
const ShareClass = require('../models/shareClass.model');
const StockOption = require('../models/stockOption.model');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Get cap table report
async function getCapTableReport(req, res) {
  try {
    // Get all shareholders with equity summary
    const shareholders = await Shareholder.getAllWithEquitySummary();
    
    // Get all share classes with total shares
    const shareClasses = await ShareClass.getAllWithTotalShares();
    
    // Calculate ownership percentages
    const totalShares = shareClasses.reduce((sum, sc) => sum + (sc.total_shares || 0), 0);
    
    const shareholdersWithPercentage = shareholders.map(shareholder => {
      const ownershipPercentage = totalShares > 0 
        ? ((shareholder.total_shares || 0) / totalShares * 100).toFixed(4) 
        : 0;
      
      return {
        ...shareholder,
        ownership_percentage: parseFloat(ownershipPercentage)
      };
    });
    
    // Sort by ownership percentage (descending)
    shareholdersWithPercentage.sort((a, b) => b.ownership_percentage - a.ownership_percentage);
    
    res.json({
      total_shares: totalShares,
      shareholders: shareholdersWithPercentage,
      share_classes: shareClasses
    });
  } catch (error) {
    console.error('Get cap table report error:', error);
    res.status(500).json({ message: 'Error generating cap table report', error: error.message });
  }
}

// Get option grants report
async function getOptionGrantsReport(req, res) {
  try {
    // Get all stock options
    const options = await StockOption.findAll();
    
    // Group by status
    const optionsByStatus = options.reduce((acc, option) => {
      if (!acc[option.status]) {
        acc[option.status] = [];
      }
      acc[option.status].push(option);
      return acc;
    }, {});
    
    // Calculate totals
    const totalActive = (optionsByStatus.active || []).reduce((sum, o) => sum + o.quantity, 0);
    const totalExercised = (optionsByStatus.exercised || []).reduce((sum, o) => sum + o.quantity, 0);
    const totalCancelled = (optionsByStatus.cancelled || []).reduce((sum, o) => sum + o.quantity, 0);
    const totalExpired = (optionsByStatus.expired || []).reduce((sum, o) => sum + o.quantity, 0);
    
    res.json({
      options,
      summary: {
        total_active: totalActive,
        total_exercised: totalExercised,
        total_cancelled: totalCancelled,
        total_expired: totalExpired,
        total_all: totalActive + totalExercised + totalCancelled + totalExpired
      }
    });
  } catch (error) {
    console.error('Get option grants report error:', error);
    res.status(500).json({ message: 'Error generating option grants report', error: error.message });
  }
}

// Get vesting schedule report
async function getVestingReport(req, res) {
  try {
    // Get upcoming vesting events
    const sql = `
      SELECT ove.id, ove.vesting_date, ove.shares_vested,
             so.id as option_id, so.grant_date, so.exercise_price,
             sh.id as shareholder_id, sh.name as shareholder_name,
             op.id as option_plan_id, op.name as option_plan_name
      FROM option_vesting_events ove
      JOIN stock_options so ON ove.stock_option_id = so.id
      JOIN shareholders sh ON so.shareholder_id = sh.id
      JOIN option_plans op ON so.option_plan_id = op.id
      WHERE so.status = 'active'
        AND ove.vesting_date >= CURDATE()
      ORDER BY ove.vesting_date ASC
      LIMIT 100
    `;
    
    const upcomingEvents = await db.query(sql);
    
    // Group by month
    const eventsByMonth = upcomingEvents.reduce((acc, event) => {
      const month = new Date(event.vesting_date).toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {});
    
    res.json({
      upcoming_events: upcomingEvents,
      events_by_month: eventsByMonth
    });
  } catch (error) {
    console.error('Get vesting report error:', error);
    res.status(500).json({ message: 'Error generating vesting report', error: error.message });
  }
}

// Export cap table to CSV
async function exportCapTableCSV(req, res) {
  try {
    // Get cap table data
    const shareholders = await Shareholder.getAllWithEquitySummary();
    const shareClasses = await ShareClass.getAllWithTotalShares();
    
    // Calculate total shares
    const totalShares = shareClasses.reduce((sum, sc) => sum + (sc.total_shares || 0), 0);
    
    // Prepare data for CSV
    const csvData = shareholders.map(shareholder => {
      const ownershipPercentage = totalShares > 0 
        ? ((shareholder.total_shares || 0) / totalShares * 100).toFixed(4) 
        : 0;
      
      return {
        'Shareholder ID': shareholder.id,
        'Name': shareholder.name,
        'Type': shareholder.type,
        'Email': shareholder.email || '',
        'Total Shares': shareholder.total_shares || 0,
        'Ownership %': ownershipPercentage
      };
    });
    
    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(csvData);
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Cap Table');
    
    // Create temp file path
    const tempFilePath = path.join(__dirname, '../uploads', `cap_table_${Date.now()}.csv`);
    
    // Write to file
    xlsx.writeFile(wb, tempFilePath);
    
    // Send file
    res.download(tempFilePath, 'cap_table.csv', (err) => {
      // Delete temp file after download
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Export cap table CSV error:', error);
    res.status(500).json({ message: 'Error exporting cap table to CSV', error: error.message });
  }
}

// Import cap table from Excel
async function importCapTableExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }
    
    // Process data
    const results = {
      success: 0,
      errors: [],
      total: data.length
    };
    
    const connection = await db.beginTransaction();
    
    try {
      for (const row of data) {
        // Validate required fields
        if (!row.Name || !row.Type) {
          results.errors.push({
            row,
            error: 'Missing required fields (Name or Type)'
          });
          continue;
        }
        
        // Check if shareholder exists
        let shareholderId;
        if (row.Email) {
          const existingShareholder = await db.getOne(
            'SELECT id FROM shareholders WHERE email = ?',
            [row.Email]
          );
          
          if (existingShareholder) {
            shareholderId = existingShareholder.id;
            
            // Update shareholder
            await db.update(
              'UPDATE shareholders SET name = ?, type = ?, phone = ?, address = ?, tax_id = ? WHERE id = ?',
              [row.Name, row.Type, row.Phone || null, row.Address || null, row.TaxID || null, shareholderId]
            );
          }
        }
        
        // Create new shareholder if not exists
        if (!shareholderId) {
          shareholderId = await db.insert(
            'INSERT INTO shareholders (name, type, email, phone, address, tax_id) VALUES (?, ?, ?, ?, ?, ?)',
            [row.Name, row.Type, row.Email || null, row.Phone || null, row.Address || null, row.TaxID || null]
          );
        }
        
        // Process equity holdings if provided
        if (row.ShareClass && row.Shares && row.PricePerShare) {
          // Find share class
          const shareClass = await db.getOne(
            'SELECT id FROM share_classes WHERE name = ?',
            [row.ShareClass]
          );
          
          if (!shareClass) {
            results.errors.push({
              row,
              error: `Share class "${row.ShareClass}" not found`
            });
            continue;
          }
          
          // Check if holding exists
          const existingHolding = await db.getOne(
            'SELECT id FROM equity_holdings WHERE shareholder_id = ? AND share_class_id = ?',
            [shareholderId, shareClass.id]
          );
          
          if (existingHolding) {
            // Update holding
            await db.update(
              'UPDATE equity_holdings SET quantity = ?, price_per_share = ? WHERE id = ?',
              [row.Shares, row.PricePerShare, existingHolding.id]
            );
          } else {
            // Create new holding
            await db.insert(
              `INSERT INTO equity_holdings 
               (shareholder_id, share_class_id, quantity, price_per_share, issue_date, certificate_number, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                shareholderId, 
                shareClass.id, 
                row.Shares, 
                row.PricePerShare, 
                row.IssueDate || new Date().toISOString().split('T')[0],
                row.CertificateNumber || null,
                row.Notes || null
              ]
            );
          }
        }
        
        results.success++;
      }
      
      await db.commitTransaction(connection);
      
      // Delete temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.json({
        message: 'Import completed',
        results
      });
    } catch (error) {
      await db.rollbackTransaction(connection);
      throw error;
    }
  } catch (error) {
    console.error('Import cap table Excel error:', error);
    
    // Delete temp file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Error importing cap table from Excel', error: error.message });
  }
}

module.exports = {
  getCapTableReport,
  getOptionGrantsReport,
  getVestingReport,
  exportCapTableCSV,
  importCapTableExcel
};
