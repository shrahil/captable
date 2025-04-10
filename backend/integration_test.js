// Integration test script for cap table management software
// This script tests the connection between frontend and backend

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@gooded.com',
  password: 'Test123!',
  first_name: 'Test',
  last_name: 'User',
  role: 'admin'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    testResults.details.push({ name, passed, error: null });
    console.log(`✅ PASSED: ${name}`);
  } else {
    testResults.failed++;
    testResults.details.push({ name, passed, error: error?.message || 'Unknown error' });
    console.log(`❌ FAILED: ${name}`);
    if (error) {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Create API client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests after login
function setAuthToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Main test function
async function runTests() {
  console.log('Starting integration tests...');
  console.log('==============================');
  
  try {
    // Test 1: Server is running
    try {
      const response = await api.get('/');
      logTest('Server is running', response.status === 200);
    } catch (error) {
      logTest('Server is running', false, error);
      console.log('Cannot connect to server. Make sure the backend is running on port 5000.');
      return;
    }
    
    // Test 2: Register user
    let userId;
    try {
      const response = await api.post('/auth/register', TEST_USER);
      userId = response.data.user.id;
      logTest('User registration', response.status === 201);
    } catch (error) {
      // If user already exists, this is fine
      if (error.response && error.response.status === 400 && 
          error.response.data.message.includes('already exists')) {
        logTest('User registration (user already exists)', true);
      } else {
        logTest('User registration', false, error);
      }
    }
    
    // Test 3: Login
    let token;
    try {
      const response = await api.post('/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      token = response.data.token;
      setAuthToken(token);
      logTest('User login', response.status === 200 && token);
    } catch (error) {
      logTest('User login', false, error);
      // Cannot continue without authentication
      return;
    }
    
    // Test 4: Get user profile
    try {
      const response = await api.get('/auth/profile');
      logTest('Get user profile', 
        response.status === 200 && 
        response.data.user.email === TEST_USER.email
      );
    } catch (error) {
      logTest('Get user profile', false, error);
    }
    
    // Test 5: Create share class
    let shareClassId;
    try {
      const shareClassData = {
        name: 'Test Common',
        description: 'Test common stock',
        liquidation_preference: 1.0,
        conversion_ratio: 1.0,
        is_preferred: false
      };
      const response = await api.post('/share-classes', shareClassData);
      shareClassId = response.data.shareClass.id;
      logTest('Create share class', response.status === 201 && shareClassId);
    } catch (error) {
      logTest('Create share class', false, error);
    }
    
    // Test 6: Create shareholder
    let shareholderId;
    try {
      const shareholderData = {
        name: 'Test Shareholder',
        type: 'founder',
        email: 'founder@example.com',
        phone: '123-456-7890',
        address: '123 Test St',
        tax_id: '123-45-6789',
        notes: 'Test shareholder'
      };
      const response = await api.post('/shareholders', shareholderData);
      shareholderId = response.data.shareholder.id;
      logTest('Create shareholder', response.status === 201 && shareholderId);
    } catch (error) {
      logTest('Create shareholder', false, error);
    }
    
    // Test 7: Create vesting schedule
    let vestingScheduleId;
    try {
      const vestingData = {
        name: 'Test 4-Year Schedule',
        total_duration_months: 48,
        cliff_months: 12,
        frequency: 'monthly',
        acceleration_on_exit: false,
        description: 'Test vesting schedule'
      };
      const response = await api.post('/vesting-schedules', vestingData);
      vestingScheduleId = response.data.schedule.id;
      logTest('Create vesting schedule', response.status === 201 && vestingScheduleId);
    } catch (error) {
      logTest('Create vesting schedule', false, error);
    }
    
    // Test 8: Create option plan
    let optionPlanId;
    if (shareClassId) {
      try {
        const planData = {
          name: 'Test Option Plan',
          share_class_id: shareClassId,
          total_shares_reserved: 1000000,
          start_date: new Date().toISOString().split('T')[0],
          description: 'Test option plan'
        };
        const response = await api.post('/option-plans', planData);
        optionPlanId = response.data.plan.id;
        logTest('Create option plan', response.status === 201 && optionPlanId);
      } catch (error) {
        logTest('Create option plan', false, error);
      }
    } else {
      logTest('Create option plan', false, new Error('Share class ID not available'));
    }
    
    // Test 9: Create stock option
    let optionId;
    if (optionPlanId && shareholderId && vestingScheduleId) {
      try {
        const today = new Date();
        const expirationDate = new Date();
        expirationDate.setFullYear(today.getFullYear() + 10);
        
        const optionData = {
          option_plan_id: optionPlanId,
          shareholder_id: shareholderId,
          vesting_schedule_id: vestingScheduleId,
          grant_date: today.toISOString().split('T')[0],
          expiration_date: expirationDate.toISOString().split('T')[0],
          quantity: 10000,
          exercise_price: 0.10,
          vesting_start_date: today.toISOString().split('T')[0],
          notes: 'Test stock option'
        };
        const response = await api.post('/options', optionData);
        optionId = response.data.option.id;
        logTest('Create stock option', response.status === 201 && optionId);
      } catch (error) {
        logTest('Create stock option', false, error);
      }
    } else {
      logTest('Create stock option', false, new Error('Required IDs not available'));
    }
    
    // Test 10: Get cap table report
    try {
      const response = await api.get('/reports/captable');
      logTest('Get cap table report', 
        response.status === 200 && 
        response.data.shareholders && 
        response.data.share_classes
      );
    } catch (error) {
      logTest('Get cap table report', false, error);
    }
    
    // Test 11: Get option grants report
    try {
      const response = await api.get('/reports/options');
      logTest('Get option grants report', 
        response.status === 200 && 
        response.data.options && 
        response.data.summary
      );
    } catch (error) {
      logTest('Get option grants report', false, error);
    }
    
    // Test 12: Get vesting report
    try {
      const response = await api.get('/reports/vesting');
      logTest('Get vesting report', 
        response.status === 200 && 
        response.data.upcoming_events && 
        response.data.events_by_month
      );
    } catch (error) {
      logTest('Get vesting report', false, error);
    }
    
    // Print summary
    console.log('\n==============================');
    console.log(`SUMMARY: ${testResults.passed}/${testResults.total} tests passed`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    // Save test results to file
    const resultsFile = path.join(__dirname, 'integration_test_results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    console.log(`\nTest results saved to ${resultsFile}`);
    
  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }
}

// Run the tests
runTests();
