-- Migration Script to Fix Debts Table Schema
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns to debts table
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS month INTEGER,
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'monthly';

-- Step 2: Update existing records to have default values
UPDATE debts 
SET 
  month = EXTRACT(MONTH FROM due_date),
  year = EXTRACT(YEAR FROM due_date),
  type = 'monthly'
WHERE month IS NULL OR year IS NULL;

-- Step 3: Make month and year NOT NULL after setting defaults
ALTER TABLE debts 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL,
ALTER COLUMN type SET NOT NULL;

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debts_month_year ON debts(month, year);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_member_status ON debts(member_id, status);

-- Step 5: Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'debts' 
ORDER BY ordinal_position;

-- Step 6: Show sample data to verify
SELECT id, member_id, amount, month, year, type, status, due_date 
FROM debts 
LIMIT 5;
