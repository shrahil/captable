// Report routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes require authentication
router.use(authenticateToken);

// Get cap table report
router.get('/captable', reportController.getCapTableReport);

// Get option grants report
router.get('/options', reportController.getOptionGrantsReport);

// Get vesting schedule report
router.get('/vesting', reportController.getVestingReport);

// Export cap table to CSV
router.get('/export/captable', reportController.exportCapTableCSV);

// Import cap table from Excel (admin only)
router.post('/import/captable', isAdmin, upload.single('file'), reportController.importCapTableExcel);

module.exports = router;
