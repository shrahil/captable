-- Cap Table Management Database Schema
-- GoodEd Technologies Pvt Ltd

-- Create database
CREATE DATABASE IF NOT EXISTS captable_db;
USE captable_db;

-- Users table for authentication and access control
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Share classes table
CREATE TABLE IF NOT EXISTS share_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  liquidation_preference DECIMAL(10,2) DEFAULT 1.00,
  conversion_ratio DECIMAL(10,2) DEFAULT 1.00,
  is_preferred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_name (name)
);

-- Shareholders table
CREATE TABLE IF NOT EXISTS shareholders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('founder', 'investor', 'employee', 'advisor', 'other') NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_email (email)
);

-- Equity holdings table
CREATE TABLE IF NOT EXISTS equity_holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shareholder_id INT NOT NULL,
  share_class_id INT NOT NULL,
  quantity BIGINT NOT NULL,
  price_per_share DECIMAL(20,10) NOT NULL,
  investment_amount DECIMAL(20,2) GENERATED ALWAYS AS (quantity * price_per_share) STORED,
  issue_date DATE NOT NULL,
  certificate_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shareholder_id) REFERENCES shareholders(id) ON DELETE CASCADE,
  FOREIGN KEY (share_class_id) REFERENCES share_classes(id) ON DELETE RESTRICT,
  INDEX idx_shareholder (shareholder_id),
  INDEX idx_share_class (share_class_id)
);

-- Vesting schedules table
CREATE TABLE IF NOT EXISTS vesting_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_duration_months INT NOT NULL,
  cliff_months INT NOT NULL DEFAULT 12,
  frequency ENUM('monthly', 'quarterly', 'annually') NOT NULL DEFAULT 'monthly',
  acceleration_on_exit BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock option plans table
CREATE TABLE IF NOT EXISTS option_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  share_class_id INT NOT NULL,
  total_shares_reserved BIGINT NOT NULL,
  shares_issued BIGINT DEFAULT 0,
  shares_available BIGINT GENERATED ALWAYS AS (total_shares_reserved - shares_issued) STORED,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (share_class_id) REFERENCES share_classes(id) ON DELETE RESTRICT,
  INDEX idx_share_class (share_class_id)
);

-- Stock options table
CREATE TABLE IF NOT EXISTS stock_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  option_plan_id INT NOT NULL,
  shareholder_id INT NOT NULL,
  vesting_schedule_id INT NOT NULL,
  grant_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  quantity BIGINT NOT NULL,
  exercise_price DECIMAL(20,10) NOT NULL,
  status ENUM('active', 'exercised', 'cancelled', 'expired') DEFAULT 'active',
  vesting_start_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (option_plan_id) REFERENCES option_plans(id) ON DELETE RESTRICT,
  FOREIGN KEY (shareholder_id) REFERENCES shareholders(id) ON DELETE CASCADE,
  FOREIGN KEY (vesting_schedule_id) REFERENCES vesting_schedules(id) ON DELETE RESTRICT,
  INDEX idx_option_plan (option_plan_id),
  INDEX idx_shareholder (shareholder_id),
  INDEX idx_vesting_schedule (vesting_schedule_id)
);

-- Option vesting events table
CREATE TABLE IF NOT EXISTS option_vesting_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_option_id INT NOT NULL,
  vesting_date DATE NOT NULL,
  shares_vested BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_option_id) REFERENCES stock_options(id) ON DELETE CASCADE,
  INDEX idx_stock_option (stock_option_id),
  INDEX idx_vesting_date (vesting_date)
);

-- Option exercises table
CREATE TABLE IF NOT EXISTS option_exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_option_id INT NOT NULL,
  exercise_date DATE NOT NULL,
  shares_exercised BIGINT NOT NULL,
  exercise_price DECIMAL(20,10) NOT NULL,
  total_exercise_cost DECIMAL(20,2) GENERATED ALWAYS AS (shares_exercised * exercise_price) STORED,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_option_id) REFERENCES stock_options(id) ON DELETE CASCADE,
  INDEX idx_stock_option (stock_option_id),
  INDEX idx_exercise_date (exercise_date)
);

-- Transactions table for tracking equity changes
CREATE TABLE IF NOT EXISTS equity_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_type ENUM('issuance', 'transfer', 'repurchase', 'conversion', 'exercise', 'cancellation') NOT NULL,
  shareholder_id INT NOT NULL,
  share_class_id INT NOT NULL,
  quantity BIGINT NOT NULL,
  price_per_share DECIMAL(20,10),
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shareholder_id) REFERENCES shareholders(id) ON DELETE CASCADE,
  FOREIGN KEY (share_class_id) REFERENCES share_classes(id) ON DELETE RESTRICT,
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_shareholder (shareholder_id),
  INDEX idx_share_class (share_class_id),
  INDEX idx_transaction_date (transaction_date)
);

-- Insert default share classes
INSERT INTO share_classes (name, description, is_preferred)
VALUES 
('Common', 'Standard common stock', FALSE),
('Series A Preferred', 'Series A preferred stock with 1x liquidation preference', TRUE);

-- Insert default vesting schedules
INSERT INTO vesting_schedules (name, total_duration_months, cliff_months, frequency, description)
VALUES 
('Standard 4-Year', 48, 12, 'monthly', '4-year vesting with 1-year cliff, monthly thereafter'),
('Accelerated 3-Year', 36, 12, 'monthly', '3-year vesting with 1-year cliff, monthly thereafter'),
('Board Member', 24, 0, 'quarterly', '2-year vesting, quarterly with no cliff');
