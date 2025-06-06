-- Comprehensive Database Schema Fix
-- This script will ensure all tables have the required columns for the application
-- Run this in your Supabase SQL Editor

-- ================================
-- 1. Fix PAYMENTS table schema
-- ================================

-- Add missing columns to payments table if they don't exist
DO $$
BEGIN
    -- Add month column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='month') THEN
        ALTER TABLE payments ADD COLUMN month INTEGER;
        RAISE NOTICE 'Added month column to payments table';
    END IF;
    
    -- Add year column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='year') THEN
        ALTER TABLE payments ADD COLUMN year INTEGER;
        RAISE NOTICE 'Added year column to payments table';
    END IF;
END $$;

-- Update existing payment records to populate month and year from payment_date
UPDATE payments 
SET 
    month = EXTRACT(MONTH FROM payment_date::date),
    year = EXTRACT(YEAR FROM payment_date::date)
WHERE month IS NULL OR year IS NULL;

-- Make month and year NOT NULL for payments
ALTER TABLE payments 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL;

-- ================================
-- 2. Fix DEBTS table schema  
-- ================================

-- Add missing columns to debts table if they don't exist
DO $$
BEGIN
    -- Add month column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='month') THEN
        ALTER TABLE debts ADD COLUMN month INTEGER;
        RAISE NOTICE 'Added month column to debts table';
    END IF;
    
    -- Add year column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='year') THEN
        ALTER TABLE debts ADD COLUMN year INTEGER;
        RAISE NOTICE 'Added year column to debts table';
    END IF;
    
    -- Add type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='type') THEN
        ALTER TABLE debts ADD COLUMN type VARCHAR(50) DEFAULT 'monthly_dues';
        RAISE NOTICE 'Added type column to debts table';
    END IF;
END $$;

-- Update existing debt records to populate month, year, and type
UPDATE debts 
SET 
    month = EXTRACT(MONTH FROM due_date::date),
    year = EXTRACT(YEAR FROM due_date::date),
    type = COALESCE(type, 'monthly_dues')
WHERE month IS NULL OR year IS NULL OR type IS NULL;

-- Make month, year, and type NOT NULL for debts
ALTER TABLE debts 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL,
ALTER COLUMN type SET NOT NULL;

-- ================================
-- 3. Add Performance Indexes
-- ================================

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON payments(month, year);

-- Indexes for debts table
CREATE INDEX IF NOT EXISTS idx_debts_member_id ON debts(member_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_month_year ON debts(month, year);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);

-- Indexes for members table
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);

-- ================================
-- 4. Verify Schema
-- ================================

-- Check payments table structure
SELECT 'PAYMENTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- Check debts table structure  
SELECT 'DEBTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'debts' 
ORDER BY ordinal_position;

-- Check members table structure
SELECT 'MEMBERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;

-- ================================
-- 5. Sample Data Check
-- ================================

-- Show sample payments
SELECT 'SAMPLE PAYMENTS:' as info;
SELECT id, member_id, amount, payment_date, month, year, created_at 
FROM payments 
ORDER BY created_at DESC 
LIMIT 3;

-- Show sample debts
SELECT 'SAMPLE DEBTS:' as info;
SELECT id, member_id, amount, due_date, month, year, type, status, created_at 
FROM debts 
ORDER BY created_at DESC 
LIMIT 3;

-- Show sample members
SELECT 'SAMPLE MEMBERS:' as info;
SELECT id, name, status, monthly_dues, total_debt, created_at 
FROM members 
ORDER BY created_at DESC 
LIMIT 3;

-- ================================
-- 6. Final Verification
-- ================================

SELECT 'SCHEMA FIX COMPLETED!' as status;
SELECT 
    (SELECT COUNT(*) FROM members) as total_members,
    (SELECT COUNT(*) FROM payments) as total_payments,
    (SELECT COUNT(*) FROM debts) as total_debts;
