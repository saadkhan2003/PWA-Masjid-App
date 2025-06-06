-- Database Migration: Add missing columns to debts table
-- Execute this script in your Supabase SQL Editor

-- Add missing columns to debts table
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month >= 1 AND month <= 12),
ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year >= 1900 AND year <= 2100),
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'monthly_dues' CHECK (type IN ('monthly_dues', 'custom', 'late_fee'));

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_debts_month_year ON debts(month, year);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);

-- Update existing debt records to have default values (if any exist)
UPDATE debts 
SET 
    month = EXTRACT(MONTH FROM due_date),
    year = EXTRACT(YEAR FROM due_date),
    type = 'custom'
WHERE month IS NULL OR year IS NULL OR type IS NULL;

-- Make the new columns NOT NULL after setting default values
ALTER TABLE debts 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL,
ALTER COLUMN type SET NOT NULL;

-- Verify the updated schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'debts' 
ORDER BY ordinal_position;
