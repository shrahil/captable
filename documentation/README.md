# Cap Table Application

## Overview
This application provides a comprehensive solution for managing your company's capitalization table, equity holdings, stock options, and vesting schedules. It allows both administrators and individual shareholders to view and manage equity-related information.

## Key Screens and Functionalities

### 1. Authentication
- **Login Screen** (`/login`)
  - User authentication with email and password
  - Role-based access control (Admin vs. Regular User)

### 2. Dashboard
- **Main Dashboard** (`/dashboard`)
  - Overview of key metrics
  - Quick access to main sections
  - Summary cards showing total shares, shareholders, and share classes

### 3. Cap Table View
- **Cap Table Screen** (`/captable`)
  - Complete view of all shareholders and their equity holdings
  - Breakdown by share class
  - Ownership percentages for each shareholder
  - Total shares issued
  - Filtering options by shareholder type and share class
  - Export functionality (CSV)
  - For admins: Import data functionality

### 4. Individual Shareholder View
- **Shareholder Detail Screen** (`/shareholders/:id`)
  - Detailed information about a specific shareholder
  - All equity holdings across different share classes
  - Stock option grants
  - Transaction history
  - Documents related to the shareholder

### 5. Stock Options Management
- **Stock Options Screen** (`/options`)
  - List of all stock option grants
  - Filtering by status, shareholder, and option plan
  - For admins: Ability to grant new options
  - Option to exercise eligible options
  - View detailed option information

### 6. Vesting Schedule View
- **Vesting Schedule Screen** (`/options/:id` or within shareholder view)
  - Visual representation of vesting schedule
  - Already vested options vs. future vesting
  - Vesting milestones and dates
  - Current value of vested and unvested options

### 7. Reports
- **Reports Screen** (`/reports`)
  - Various pre-configured reports
  - Export options (CSV, PDF)
  - Data visualization (charts and graphs)
  - Historical equity data

### 8. Admin Features
- **Import Data** (`/import`)
  - Upload CSV files to import shareholder data
  - Template downloading
  - Validation and error checking
- **Share Class Management**
  - Create and configure share classes
  - Set preferences and conversion terms
- **Option Plan Management**
  - Create and configure option plans
  - Set plan parameters (pool size, exercise price, etc.)

## Testing the Application

### Setting Up for Testing

1. **Environment Setup**
   - Ensure the backend and frontend are running
   - Backend: Navigate to `/backend` and run `npm start`
   - Frontend: Navigate to `/frontend` and run `npm run dev`

2. **Test Accounts**
   - Admin account: Use the credentials created with the `create-admin.js` script
   - Regular user: Create a test shareholder account

### Testing Key Functionalities

#### 1. Cap Table View Testing
- Log in as an admin user
- Navigate to the Cap Table view (`/captable`)
- Verify that all shareholders are displayed with correct information
- Test the filtering functionality
- Test the export functionality
- Import test data and verify it appears correctly

#### 2. Individual Equity & Vesting Schedule Testing
- Log in as a regular user (shareholder)
- Verify that they can see only their own equity information
- Check the vesting schedule visualization
- Confirm that vested and unvested portions are correctly displayed
- Test any calculations for current value based on the latest valuation

#### 3. Stock Option Testing
- As an admin, grant new stock options to a shareholder
- Set up a vesting schedule
- Log in as that shareholder and verify they can see the new grant
- Test the option exercise functionality (if implemented)
- Verify that exercised options correctly move to the cap table

#### 4. Data Import/Export Testing
- Test importing various CSV files with different data structures
- Verify error handling for malformed files
- Test the export functionality for different reports

#### 5. Permission Testing
- Verify that regular users cannot access admin-only features
- Ensure shareholders can only view their own information
- Test that protected routes redirect unauthorized users

### Integration Testing

The application includes an integration test script (`integration_test.js`) in the backend folder. Run this to verify that the API endpoints are functioning correctly:

```
cd backend
node integration_test.js
```

## API Endpoints

The application exposes several REST API endpoints:

- Auth: `/api/auth/*` (login, register, etc.)
- Shareholders: `/api/shareholders/*`
- Equity Holdings: `/api/equity-holdings/*`
- Share Classes: `/api/share-classes/*`
- Stock Options: `/api/stock-options/*`
- Vesting Schedules: `/api/vesting-schedules/*`
- Option Plans: `/api/option-plans/*`
- Reports: `/api/reports/*`

## Database Schema

The application uses a relational database with the following key tables:

- Users (Authentication)
- Shareholders
- EquityHoldings
- ShareClasses
- StockOptions
- VestingSchedules
- OptionPlans
- Transactions

Refer to `database.sql` in the backend folder for the complete schema.
